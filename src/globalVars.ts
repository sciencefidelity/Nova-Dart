import { DartLanguageClient } from "./dartLspService"
import { FlutterDaemonService } from "./flutterDaemonService"
import { FlutterRunService } from "./flutterRunService"

export const keys = {
  analyzerPath: "sciencefidelity.dart.config.analyzerPath",
  enableAnalyzer: "sciencefidelity.dart.config.enableAnalyzer",
  flutterCreate: "sciencefidelity.dart.commands.flutterCreate",
  flutterRun: "sciencefidelity.dart.commands.flutterRun",
  flutterStop: "sciencefidelity.dart.commands.flutterStop",
  formatDocument: "sciencefidelity.dart.commands.formatDocument",
  formatDocumentOnSave: "sciencefidelity.dart.config.formatDocumentOnSave",
  getDaemonVersion: "sciencefidelity.dart.commands.getDaemonVersion",
  getDependencies: "sciencefidelity.dart.commands.getDependencies",
  hotReload: "sciencefidelity.dart.commands.hotReload",
  openEmulator: "sciencefidelity.dart.commands.openEmulator",
  openSimulator: "sciencefidelity.dart.commands.openSimulator",
  openWorkspaceConfig: "sciencefidelity.dart.commands.openWorkspaceConfig",
  reloadLspKey: "sciencefidelity.dart.commands.reloadLsp"
}

export const state = {
  appId: null as string | null,
  client: null as DartLanguageClient | null,
  daemon: null as FlutterDaemonService | null,
  daemonSubs: null as CompositeDisposable | null,
  flutterRunService: null as FlutterRunService | null,
  editorSubs: null as CompositeDisposable | null,
  runSubs: null as CompositeDisposable | null,
  globalSubs: null as CompositeDisposable | null,
  lspSubs: null as CompositeDisposable | null,
  runProcess: null as Process | null
}

export const vars = {
  analysisServer: undefined as string | undefined,
  appId: undefined as string | undefined,
  daemonPid: undefined as number | undefined,
  outline: undefined as any,
  runPid: undefined as number | undefined,
  syntaxes: ["dart"] as string[],
  wsUri: undefined as string | undefined
}
