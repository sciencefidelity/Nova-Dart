export const keys = {
  analyzerPath: "sciencefidelity.dart.config.analyzerPath",
  enableAnalyzer: "sciencefidelity.dart.config.enableAnalyzer",
  flutterRun: "sciencefidelity.dart.commands.flutterRun",
  flutterStop: "sciencefidelity.dart.commands.flutterStop",
  formatDocument: "sciencefidelity.dart.commands.formatDocument",
  formatDocumentOnSave: "sciencefidelity.dart.config.formatDocumentOnSave",
  getDependencies: "sciencefidelity.dart.commands.getDependencies",
  hotReload: "sciencefidelity.dart.commands.hotReload",
  openEmulator: "sciencefidelity.dart.commands.openEmulator",
  openSimulator: "sciencefidelity.dart.commands.openSimulator",
  openWorkspaceConfig: "sciencefidelity.dart.openWorkspaceConfig",
  reloadLspKey: "sciencefidelity.dart.commands.reloadLsp"
}

export const state = {
  appId: null as string | null,
  client: null as LanguageClient | null,
  daemon: null as Process | null,
  globalSubscriptions: null as CompositeDisposable | null,
  lspSubscriptions: null as CompositeDisposable | null,
  editorSubscriptions: null as CompositeDisposable | null
}

export const vars = {
  syntaxes: ["dart"] as string[]
}
