import { cleanPath, preferences } from "nova-extension-utils"
import { daemon } from "./startFlutterDaemon"
import { registerFormatDocument } from "./commands/formatDocument"
import { makeFileExecutable } from "./novaUtils"
import { informationView } from "./informationView"
import { compositeDisposable } from "./main"

export let client: LanguageClient | null = null
const syntaxes = ["dart"]
const formatOnSaveKey = "sciencefidelity.dart.config.formatDocumentOnSave"

export async function activateLsp() {
  informationView.status = "Activating..."

  // Uploading to the extension library makes this file unexecutable
  const runFile = nova.path.join(nova.extension.path, "run.sh")
  await makeFileExecutable(runFile)

  let workspacePath = ""
  if (nova.inDevMode() && nova.workspace.path) {
    workspacePath = `${cleanPath(nova.workspace.path)}/test-workspace`
  } else if (nova.workspace.path) {
    workspacePath = cleanPath(nova.workspace.path)
  }

  let serviceArgs

  if (nova.inDevMode() && nova.workspace.path) {
    const logDir = nova.path.join(nova.workspace.path, "logs")
    await new Promise<void>((resolve, reject) => {
      const p = new Process("/usr/bin/env", {
        args: ["mkdir", "-p", logDir]
      })
      p.onDidExit(status => (status === 0 ? resolve() : reject()))
      p.start()
    })
    console.log("logging to", logDir)
    const outLog = nova.path.join(logDir, "languageServer.log")
    serviceArgs = {
      path: "/usr/bin/env",
      args: ["bash", "-c", `"${runFile}" | tee "${outLog}"`]
    }
  } else {
    serviceArgs = { path: runFile }
  }

  const serverOptions = {
    ...serviceArgs,
    env: {
      WORKSPACE_DIR: workspacePath,
      INSTALL_DIR:
        nova.config.get("sciencefidelity.dart.config.analyzerPath", "string") ||
        "~/flutter/bin/cache/dart-sdk/bin/snapshots"
    }
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
