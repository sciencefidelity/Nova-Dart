import { preferences } from "nova-extension-utils"
import { daemon } from "./startFlutterDaemon"
import { registerFormatDocument } from "./commands/formatDocument"
import { informationView } from "./informationView"
import { compositeDisposable } from "./main"
import { findDart } from "./utils/findDart"

export let client: LanguageClient | null = null
const syntaxes = ["dart"]
const formatOnSaveKey = "sciencefidelity.dart.config.formatDocumentOnSave"

export const activateLsp = async () => {
  informationView.status = "Activating..."
  let analyzerPath = nova.config.get(
    "sciencefidelity.dart.config.analyzerPath",
    "string"
  )

  if (!analyzerPath) {
    try {
      analyzerPath = await findDart()
    } catch (err) {
      console.error(err)
      nova.workspace.showErrorMessage(err)
    }
  }

  const analysisServer = `${analyzerPath
    ?.trim()
    .replace(
      "/bin/dart",
      "/bin/cache/dart-sdk/bin/snapshots"
    )}/analysis_server.dart.snapshot`

  console.log(`Path to analysis server: ${analysisServer}`)
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
    syntaxes: syntaxes
  }

  client = new LanguageClient(
    "sciencefidelity.dart",
    "Dart Language Server",
    serverOptions,
    clientOptions
  )

  compositeDisposable.add(
    client.onDidStop(err => {
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
  client.start()
  // client.onNotification(
  //   "dart/textDocument/publishFlutterOutline",
  //   notification => {
  //     console.log(JSON.stringify(notification))
  //   }
  // )

  // Register format on save command
  compositeDisposable.add(registerFormatDocument(client))

  compositeDisposable.add(
    nova.workspace.onDidAddTextEditor(editor => {
      const editorDisposable = new CompositeDisposable()
      compositeDisposable.add(editorDisposable)
      compositeDisposable.add(
        editor.onDidDestroy(() => {
          editorDisposable.dispose()
          daemon?.kill()
        })
      )

      const setupListener = () => {
        if (
          !(syntaxes as Array<string | null>).includes(editor.document.syntax)
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
