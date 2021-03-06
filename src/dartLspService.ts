import { cleanPath, preferences } from "nova-extension-utils"
import { registerFormatDocument } from "./commands/formatDocument"
import { keys, state, vars } from "./globalVars"
import { info } from "./informationView"
import { findDartPath } from "./utils/findDart"
import { cancelSubs, makeFileExecutable, showActionableError, wrapCommand } from "./utils/utils"

export class DartLanguageClient {
  languageClient: LanguageClient | null
  constructor() {
    this.languageClient = null
    this.activate = this.activate.bind(this)
    this.deactivate = this.deactivate.bind(this)
    this.reload = this.reload.bind(this)
    this.subscribe = this.subscribe.bind(this)
    this.startSubs = this.startSubs.bind(this)
    this.debugPort = this.debugPort.bind(this)
  }

  // start the language client
  async activate(active: boolean) {
    if (this.languageClient) await this.deactivate()
    active ? console.log("Reloading...") : console.log("Activating...")
    active ? (info.status = "Reloading...") : (info.status = "Activating...")
    if (nova.inDevMode() && !active) {
      const notification = new NotificationRequest("activated")
      notification.body = "Dart LSP is loading"
      nova.notifications.add(notification)
    }
    state.lspSubs = new CompositeDisposable()
    let analyzerPath: string | null = null
    try {
      analyzerPath = await findDartPath()
    } catch (err) {
      console.error(err)
      throw new Error("Dart Analyzer not found.")
    }

    if (analyzerPath === "") return

    let _args = ["dart", `${analyzerPath}`, "--lsp"]
    let _env = {}
    // enable logs in dev mode
    if (nova.inDevMode()) {
      const runFile = nova.path.join(nova.extension.path, "run.sh")
      await makeFileExecutable(runFile)
      const logDir = nova.path.join(nova.workspace.path!, "logs")
      await new Promise<void>((resolve, reject) => {
        const p = new Process("/usr/bin/env", {
          args: ["mkdir", "-p", logDir]
        })
        p.onDidExit(status => (status === 0 ? resolve() : reject()))
        p.start()
      })
      console.log("Logging to", logDir + "/lsp.log")
      const outLog = nova.path.join(logDir, "lsp.log")
      _args = ["bash", "-c", `"${runFile}" | tee "${outLog}"`]
      _env = {
        WORKSPACE_DIR:
          `${cleanPath(nova.workspace.path!)}/test-workspace` ?? "",
        INSTALL_DIR: analyzerPath
      }
    }

    const serverOptions: ServerOptions = {
      type: "stdio",
      path: "/usr/bin/env",
      args: _args,
      env: _env
    }
    const clientOptions = {
      initializationOptions: {
        onlyAnalyzeProjectsWithOpenFiles: true,
        suggestFromUnimportedLibraries: true,
        closingLabels: true,
        outline: true,
        flutterOutline: true
      },
      syntaxes: vars.syntaxes
    }

    const client = new LanguageClient(
      "sciencefidelity.dart",
      "Dart Language Server",
      serverOptions,
      clientOptions
    )
    this.languageClient = client
    try {
      this.languageClient.start()
    } catch (err) {
      console.error(err)
      throw new Error("Dart LSP failed to start")
    }
    await this.subscribe()

    nova.commands.register(keys.diagnosticServer, wrapCommand(this.debugPort))
    console.log("LSP Running")
    info.status = "Running"
    info.reload()
  }

  debugPort() {
    this.languageClient
      ?.sendRequest("dart/diagnosticServer")
      .then(value => console.log("Debug port", JSON.stringify(value)))
  }

  // stop the language client
  async deactivate() {
    this.languageClient?.stop()
    await cancelSubs(state.editorSubs)
    await cancelSubs(state.lspSubs)
    this.languageClient = null
    info.status = "Inactive"
  }

  // reload the language client
  async reload() {
    await this.deactivate()
    // true means the LSP is active when called
    this.activate(true)
  }

  // add disposables
  async subscribe() {
    // show alert if LSP crashes
    this.languageClient &&
      state.lspSubs?.add(
        this.languageClient.onDidStop((err: any) => {
          info.status = "Inactive"
          showActionableError(
            "analyzer-stopped",
            "Dart Language Server stopped unexpectedly,",
            (err && err.toString()) ||
              "if this problem persits please report it.",
            ["Restart", "Ignore"],
            (r: number) => {
              switch (r) {
                case 0:
                  // false means the LSP is not active when called
                  this.activate(false)
                  break
              }
            }
          )
        })
      )
    // Register format on save command
    this.languageClient &&
      state.lspSubs?.add(registerFormatDocument(this.languageClient))
    this.startSubs()
  }

  startSubs() {
    state.lspSubs?.add(
      nova.workspace.onDidAddTextEditor(editor => {
        state.editorSubs = new CompositeDisposable()
        state.lspSubs?.add(state.editorSubs)
        state.lspSubs?.add(
          editor.onDidDestroy(() => {
            state.editorSubs?.dispose()
            state.editorSubs = null
          })
        )
        //prettier-ignore
        const setupListener = () => {
          if (!(vars.syntaxes as Array<string | null>)
            .includes(editor.document.syntax)) return

          const formatOnSave = preferences.getOverridableBoolean(
            keys.formatDocumentOnSave
          )
          if (!formatOnSave) return
          return editor.onWillSave(async editor => {
            await nova.commands.invoke(keys.formatDocument, editor)
          })
        }

        let willSaveListener = setupListener()
        state.lspSubs?.add({
          dispose() {
            willSaveListener?.dispose()
          }
        })
        const refreshListener = () => {
          willSaveListener?.dispose()
          willSaveListener = setupListener()
        }
        state.editorSubs.add(editor.document.onDidChangeSyntax(refreshListener))
        // prettier-ignore
        state.editorSubs.add(
          nova.config.onDidChange(
            keys.formatDocumentOnSave,
            refreshListener
          )
        )
        state.editorSubs.add(
          nova.workspace.config.onDidChange(
            keys.formatDocumentOnSave,
            refreshListener
          )
        )
      })
    )
  }
}
