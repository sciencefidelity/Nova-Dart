import { preferences } from "nova-extension-utils"
import { registerFormatDocument } from "./commands/formatDocument"
import { informationView } from "./informationView"
import { compositeDisposable } from "./main"
import { findDartPath } from "./utils/findDart"
import { vars, state } from "./main"

const formatOnSaveKey = "sciencefidelity.dart.config.formatDocumentOnSave"

export const activateLsp = async () => {
  if (state.client) await deactivateLsp()
  informationView.status = "Activating..."
  let analyzerPath = null
  try {
    analyzerPath = await findDartPath()
  } catch (err) {
    console.error(err)
    throw new Error("Dart Analyzer not found.")
  }

  const analysisServer = `${analyzerPath
    ?.trim()
    .replace(
      "/bin/dart",
      "/bin/cache/dart-sdk/bin/snapshots"
    )}/analysis_server.dart.snapshot`
  console.log(`Analyzer path is: ${analysisServer}`)

  const serverOptions: ServerOptions = {
    type: "stdio",
    path: "/usr/bin/env",
    args: ["dart", `${analysisServer}`, "--lsp"]
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

  state.client = new LanguageClient(
    "sciencefidelity.dart",
    "Dart Language Server",
    serverOptions,
    clientOptions
  )

  compositeDisposable.add(
    state.client.onDidStop(err => {
      let message = "Dart Language Server stopped unexpectedly"
      if (err) {
        message += `:\n\n${err.toString()}`
      } else {
        message += "."
      }
      nova.workspace.showActionPanel(
        message,
        { buttons: ["Restart", "Ignore"] },
        index => {
          if (index == 0) {
            nova.commands.invoke("sciencefidelity.dart.reload")
          }
        }
      )
    })
  )
  try {
    state.client.start()
    // nova.subscriptions.add(state.client)
  } catch (err) {
    if (nova.inDevMode()) {
      console.error(err)
    }
  }
  // client.onNotification(
  //   "dart/textDocument/publishFlutterOutline",
  //   notification => {
  //     console.log(JSON.stringify(notification))
  //   }
  // )

  // Register format on save command
  compositeDisposable.add(registerFormatDocument(state.client))

  compositeDisposable.add(
    nova.workspace.onDidAddTextEditor(editor => {
      const editorDisposable = new CompositeDisposable()
      compositeDisposable.add(editorDisposable)
      compositeDisposable.add(
        editor.onDidDestroy(() => {
          editorDisposable.dispose()
          state.daemon?.kill()
        })
      )

      const setupListener = () => {
        if (
          !(vars.syntaxes as Array<string | null>).includes(editor.document.syntax)
        ) {
          return
        }
        const formatDocumentOnSave =
          preferences.getOverridableBoolean(formatOnSaveKey)
        if (!formatDocumentOnSave) {
          return
        }
        return editor.onWillSave(async editor => {
          if (formatDocumentOnSave) {
            await nova.commands.invoke(
              "sciencefidelity.dart.commands.formatDocument",
              editor
            )
          }
        })
      }

      let willSaveListener = setupListener()
      compositeDisposable.add({
        dispose() {
          willSaveListener?.dispose()
        }
      })

      const refreshListener = () => {
        willSaveListener?.dispose()
        willSaveListener = setupListener()
      }

      // watch things that might change if this needs to happen or not
      editorDisposable.add(editor.document.onDidChangeSyntax(refreshListener))
      editorDisposable.add(
        nova.config.onDidChange(formatOnSaveKey, refreshListener)
      )
      editorDisposable.add(
        nova.workspace.config.onDidChange(formatOnSaveKey, refreshListener)
      )
    })
  )

  informationView.status = "Running"
  informationView.reload()
}

// Reload LSP
export const reloadLsp = async () => {
  if (
    nova.config.get("sciencefidelity.dart.config.enableAnalyzer", "boolean")
  ) {
    deactivateLsp()
    state.client = null
    console.log("reloading...")
    await activateLsp()
  }
}

export const deactivateLsp = async () => {
  if (state.client) {
    state.client.stop()
    state.client = null
  }
}
