import { state, vars } from "./globalVars"
import { Information } from "./informationView"
import { addLspSubscriptions, cancelSubscriptions } from "./manageSubscriptions"
import { findDartPath } from "./utils/findDart"

export async function activateLsp(reload: boolean) {
  if (state.client) await deactivateLsp()
  reload ? console.log("Reloading...") : console.log("Activating...")
  if (nova.inDevMode() && !reload) {
    const notification = new NotificationRequest("activated")
    notification.body = "Dart LSP is loading"
    nova.notifications.add(notification)
  }
  // prettier-ignore
  reload ? Information.status = "Reloading..." : Information.status = "Activating..."
  state.lspSubscriptions = new CompositeDisposable()
  let analyzerPath: string | null = null
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
  try {
    state.client.start()
  } catch (err) {
    console.error(err)
    throw new Error(err)
  }
  await addLspSubscriptions()
  // TODO: Do something with the Flutter outline
  // client.onNotification(
  //   "dart/textDocument/publishFlutterOutline",
  //   notification => {
  //     console.log(JSON.stringify(notification))
  //   }
  // )
  console.log("LSP Running")
  Information.status = "Running"
  Information.reload()
}

// Reload LSP
export async function reloadLsp() {
  if (state.client) await deactivateLsp()
  // false = "Activating..." | true = "Reloading..."
  activateLsp(true)
}

export async function deactivateLsp() {
  if (state.client) {
    await cancelSubscriptions(state.editorSubscriptions)
    await cancelSubscriptions(state.lspSubscriptions)
    state.client.stop()
    state.client = null
    Information.status = "Inactive"
  }
}
