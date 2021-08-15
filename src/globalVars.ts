import { JsonRpcService } from "./utils/jsonrpc"

export const keys = {
  analyzerPath: "sciencefidelity.dart.config.analyzerPath",
  enableAnalyzer: "sciencefidelity.dart.config.enableAnalyzer",
  flutterCreate: "sciencefidelity.dart.commands.flutterCreate",
  flutterRun: "sciencefidelity.dart.commands.flutterRun",
  flutterStop: "sciencefidelity.dart.commands.flutterStop",
  formatDocument: "sciencefidelity.dart.commands.formatDocument",
  formatDocumentOnSave: "sciencefidelity.dart.config.formatDocumentOnSave",
  getDependencies: "sciencefidelity.dart.commands.getDependencies",
  hotReload: "sciencefidelity.dart.commands.hotReload",
  openEmulator: "sciencefidelity.dart.commands.openEmulator",
  openSimulator: "sciencefidelity.dart.commands.openSimulator",
  openWorkspaceConfig: "sciencefidelity.dart.commands.openWorkspaceConfig",
  reloadLspKey: "sciencefidelity.dart.commands.reloadLsp"
}

export const state = {
  appId: null as string | null,
  client: null as LanguageClient | null,
  daemon: null as Process | null,
  editorSubs: null as CompositeDisposable | null,
  globalSubs: null as CompositeDisposable | null,
  jsonRpc: null as JsonRpcService | null,
  lspSubs: null as CompositeDisposable | null
}

export const vars = {
  syntaxes: ["dart"] as string[]
}
