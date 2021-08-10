import { preferences } from "nova-extension-utils"
import { daemon } from "./startFlutterDaemon"
import { registerFormatDocument } from "./commands/formatDocument"
import { informationView } from "./informationView"
import { compositeDisposable } from "./main"
import { makeFileExecutable } from "./novaUtils"

export let client: LanguageClient | null = null
const syntaxes = ["dart"]
const formatOnSaveKey = "sciencefidelity.dart.config.formatDocumentOnSave"

export async function activateLsp() {
  informationView.status = "Activating..."

  const findDartFile = nova.path.join(nova.extension.path, "findDart.sh")
  await makeFileExecutable(findDartFile)

  async function findDart() {
    return new Promise<string | null>((resolve, reject) => {
      const find = new Process("/usr/bin/env", {
        args: ["zsh", "-c", `"${findDartFile}"`],
        stdio: ["ignore", "pipe", "ignore"]
      })
      let analyzerPath: string | null = null
      find.onStdout(async function (line) {
        analyzerPath = line
      })
      find.onDidExit(status => {
        if (status === 0) {
          resolve(analyzerPath)
        } else {
          reject(status)
        }
      })
      find.start()
    })
  }

  findDart().then(analyzerPath => {
    if (!analyzerPath) {
      analyzerPath = nova.config.get(
        "sciencefidelity.dart.config.analyzerPath",
        "string"
      )
    }

    const analysisServer = `${analyzerPath
      ?.trim()
      .replace(
        "/bin/dart",
        "/bin/cache/dart-sdk/bin/snapshots"
      )}/analysis_server.dart.snapshot`

    console.log(`Path to analysis server: ${analysisServer}`)
    const serverOptions = {
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

    // Register format on save command
    compositeDisposable.add(registerFormatDocument(client))

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
          {
            buttons: ["Restart", "Ignore"]
          },
          index => {
            if (index == 0) {
              nova.commands.invoke("sciencefidelity.dart.reload")
            }
          }
        )
      })
    )

    client.start()
  })
  // client.onNotification(
  //   "dart/textDocument/publishFlutterOutline",
  //   notification => {
  //     console.log(JSON.stringify(notification))
  //   }
  // )

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

      // watch things that might change if this needs to happen or not
      editorDisposable.add(editor.document.onDidChangeSyntax(refreshListener))
      editorDisposable.add(
        nova.config.onDidChange(formatOnSaveKey, refreshListener)
      )
      editorDisposable.add(
        nova.workspace.config.onDidChange(formatOnSaveKey, refreshListener)
      )

      let willSaveListener = setupListener()
      compositeDisposable.add({
        dispose() {
          willSaveListener?.dispose()
        }
      })

      function refreshListener() {
        willSaveListener?.dispose()
        willSaveListener = setupListener()
      }

      function setupListener() {
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
    })
  )

  informationView.status = "Running"
  informationView.reload()
}
