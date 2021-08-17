import { preferences } from "nova-extension-utils"
import { keys, state, vars } from "./globalVars"
import { Info as info } from "./informationView"
import { cancelSubs } from "./manageSubscriptions"
import { findDartPath } from "./utils/findDart"
import { registerFormatDocument } from "./commands/formatDocument"
import { showActionableError } from "./utils/utils"

const serverOptions: ServerOptions = {
  type: "stdio",
  path: "/usr/bin/env",
  args: ["dart", `${vars.analysisServer}`, "--lsp"]
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

export class DartLanguageClient extends LanguageClient {
  // analyzerPath: string
  clientOptions: { initializationOptions?: any; syntaxes: string[] }
  serverOptions: ServerOptions

  constructor() {
    super(
      "sciencefidelity.dart",
      "Dart Language Server",
      serverOptions,
      clientOptions
    )
    this.clientOptions = clientOptions
    this.serverOptions = serverOptions
  }

  async findPath() {
    findDartPath()
      .then(response => {
        vars.analysisServer = `${response
          .trim()
          .replace(
            "/bin/dart",
            "/bin/cache/dart-sdk/bin/snapshots"
          )}/analysis_server.dart.snapshot`
      })
      .catch(err => {
        console.log(err)
        throw new Error(err)
      })
  }

  async activate(active: boolean) {
    await this.deactivate()
    active ? console.log("Activating...") : console.log("Reloading...")
    active ? (info.status = "Activating...") : (info.status = "Reloading...")
    if (nova.inDevMode() && !this.reload) {
      const notification = new NotificationRequest("activated")
      notification.body = "Dart LSP is loading"
      nova.notifications.add(notification)
    }
    state.lspSubs = new CompositeDisposable()

    this.findPath()
    console.log(`Analyzer path is: ${vars.analysisServer}`)

    try {
      this.start()
    } catch (err) {
      console.error(err)
      throw new Error(err)
    }
    await this.subscribe()
    // TODO: Do something with the Flutter outline
    this.onNotification(
      "dart/textDocument/publishFlutterOutline",
      notification => {
        vars.outline = notification
      }
    )
    console.log("LSP Running")
    info.status = "Running"
    info.reload()
  }

  async deactivate() {
    await cancelSubs(state.editorSubs)
    await cancelSubs(state.lspSubs)
    this.stop()
    info.status = "Inactive"
  }
  async reload() {
    await this.deactivate()
    // false means the LSP is not active when function is called
    this.activate(false)
  }
  async subscribe() {
    // Register format on save command
    state.lspSubs?.add(
      // show alert if LSP crashes
      this.onDidStop(err => {
        showActionableError(
          "analyzer-stopped",
          "Dart Language Server stopped unexpectedly",
          (err && err.toString()) ||
            "Please report this, along with any output in the console",
          ["Restart", "Ignore"],
          (r: number) => {
            switch (r) {
              case 0:
                this.activate(true)
                break
            }
          }
        )
      })
    )
    state.lspSubs?.add(registerFormatDocument(this))
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
        state.editorSubs.add(
          nova.config.onDidChange(keys.formatDocumentOnSave, refreshListener)
        )
        //prettier-ignore
        state.editorSubs.add(
          nova.workspace.config.onDidChange(keys.formatDocumentOnSave, refreshListener)
        )
      })
    )
  }
}
