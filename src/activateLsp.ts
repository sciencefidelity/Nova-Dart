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

  let analyzerPath: string | null = null
  async function findDart() {
    return new Promise<string | null>((resolve, reject) => {

      const find = new Process("/bin/sh", {
        args: ["bash", "-c", `"${findDartFile}"`],
        stdio: "pipe",
        shell: true
      })
      find.onStdout(async function (line) {
        // analyzerPath = line.replace(/dart$/i, "snapshots")
        console.log("analyzer path:" + line)
      })
      find.onStderr(async function (line) {
        // analyzerPath = line.replace(/dart$/i, "snapshots")
        console.log("analyzer path:" + line)
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

  findDart()

  if (!analyzerPath) {
    analyzerPath = nova.config.get(
      "sciencefidelity.dart.config.analyzerPath",
      "string"
    )
  }

  const serverOptions = {
    path: "/usr/bin/env",
    args: ["dart", `${analyzerPath}/analysis_server.dart.snapshot`, "--lsp"]
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
      message +=
        "\n\nPlease report this, along with any output in the Extension Console."
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
