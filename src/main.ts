// import { activateLsp, deactivateLsp, reloadLsp } from "./activateLsp"
import { DartLanguageClient } from "./dartLspService"
import { DartColorAssistant } from "./colors"
import { flutterCreate } from "./commands/flutterCreate"
import { registerFlutterRun } from "./flutterRunService"
import { registerGetDependencies } from "./commands/getDependencies"
import { registerOpenEmulator } from "./commands/openEmulator"
import { registerOpenSimulator } from "./commands/openSimulartor"
import { keys, state, vars } from "./globalVars"
import { info } from "./informationView"
import { cancelSubs } from "./utils/utils"
import { FlutterDaemonService } from "./flutterDaemonService"
import { getDartVersion, getFlutterVersion } from "./utils/getVersions"
import { cleanPid, wrapCommand } from "./utils/utils"

// Start color assistant
const Colors = new DartColorAssistant()
nova.assistants.registerColorAssistant(["dart"], Colors)

// Register command to open workspace config
nova.commands.register(
  keys.openWorkspaceConfig,
  wrapCommand(function openWorkspaceConfig(workspace: Workspace) {
    workspace.openConfig()
  })
)

// register command to reload the LSP
nova.commands.register(keys.flutterCreate, flutterCreate)

// watch the preferences for enable analysis server
nova.config.onDidChange(keys.enableAnalyzer, async current => {
  current ? state.client?.activate(true) : state.client?.deactivate()
})

export async function activate() {
  // Resgister subscriptions
  state.lspSubs && await cancelSubs(state.lspSubs)
  state.globalSubs = new CompositeDisposable()
  // add commands to global Composite Disposable
  state.globalSubs?.add(registerFlutterRun())
  state.globalSubs?.add(registerOpenSimulator())
  state.globalSubs?.add(registerOpenEmulator())
  state.globalSubs?.add(registerGetDependencies())
  state.globalSubs?.add(info)

  // find installed Dart and Flutter versions
  getDartVersion()
    .then(response => (info.dartVersion = response))
    .catch(() => console.log("Dart version not found"))

  getFlutterVersion()
    .then(response => (info.flutterVersion = response))
    .catch(() => console.log("Flutter version not found"))

  // start the LSP server
  state.client = new DartLanguageClient()
  if (nova.config.get(keys.enableAnalyzer, "boolean")) {
    try {
      // false means the LSP is not active when called
      state.client.activate(false)
    } catch (err) {
      console.error(err)
      throw new Error(err)
    }
    nova.commands.register(keys.reloadLspKey, state.client.reload)
  }
  // start the Flutter Daemon
  state.daemon = new FlutterDaemonService()
  state.daemon.start()
  info.reload()
}

// deactivate everything when the plugin in deactivated
export async function deactivate() {
  await state.client?.deactivate()
  state.editorSubs && await cancelSubs(state.editorSubs)
  state.lspSubs && await cancelSubs(state.lspSubs)
  state.daemon?.stop()
  vars.daemonPid && cleanPid(vars.daemonPid)
  vars.runPid && cleanPid(vars.runPid)
  cancelSubs(state.globalSubs)
}
