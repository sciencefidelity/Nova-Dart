import { informationView } from "./informationView"
import { findDartPath } from "./utils/findDart"
import { vars, state } from "./main"
import { addLspSubscriptions, cancelSubscriptions } from "./manageSubscriptions"

export const activateLsp = async () => {
  state.lspSubscriptions = new CompositeDisposable()
  if (state.client) {
    await cancelSubscriptions(state.lspSubscriptions)
    await deactivateLsp()
  }
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
  await addLspSubscriptions()
  try {
    state.client.start()
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

  informationView.status = "Running"
  informationView.reload()
}

// Reload LSP
export async function reloadLsp() {
  if (state.client) {
    await cancelSubscriptions(state.editorSubscriptions)
    await cancelSubscriptions(state.lspSubscriptions)
    await deactivateLsp()
    console.log("reloading...")
    await activateLsp()
  }
}

export async function deactivateLsp() {
  if (state.client) {
    state.client.stop()
    state.client = null
  }
}
