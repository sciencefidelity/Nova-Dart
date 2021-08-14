import { activateLsp, deactivateLsp, reloadLsp } from "./activateLsp"
import { DartColorAssistant } from "./colors"
import { registerFlutterRun, registerFlutterStop } from "./commands/flutterRun"
import { registerGetDaemonVersion } from "./commands/getDaemonVersion"
import { registerGetDependencies } from "./commands/getDependencies"
import { registerOpenEmulator } from "./commands/openEmulator"
import { registerOpenSimulator } from "./commands/openSimulartor"
import { keys, state } from "./globalVars"
import { Info } from "./informationView"
import { cancelSubs } from "./manageSubscriptions"
import { startFlutterDeamon } from "./startFlutterDaemon"
import { getDartVersion, getFlutterVersion } from "./utils/getVersions"
import { stopProcess, wrapCommand } from "./utils/utils"

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
nova.commands.register(keys.reloadLspKey, reloadLsp)

// watch the preferences for enable analysis server
nova.config.onDidChange(keys.enableAnalyzer, async current => {
  // false = "Activating..." | true = "Reloading..."
  current ? activateLsp(false) : deactivateLsp()
})

export async function activate() {
  // Resgister subscriptions
  if (state.lspSubs) await cancelSubs(state.lspSubs)
  state.globalSubs = new CompositeDisposable()
  // add commands to global Composite Disposable
  state.globalSubs?.add(registerFlutterRun())
  state.globalSubs?.add(registerFlutterStop())
  state.globalSubs?.add(registerOpenSimulator())
  state.globalSubs?.add(registerOpenEmulator())
  state.globalSubs?.add(registerGetDaemonVersion())
  state.globalSubs?.add(registerGetDependencies())
  state.globalSubs?.add(Info)

  // find installed Dart and Flutter versions
  getDartVersion()
    .then(response => (Info.dartVersion = response))
    .catch(() => console.log("Dart version not found"))

  getFlutterVersion()
    .then(response => (Info.flutterVersion = response))
    .catch(() => console.log("Flutter version not found"))

  // start the LSP server
  // false = "Activating..." | true = "Reloading..."
  if (nova.config.get(keys.enableAnalyzer, "boolean")) {
    try {
      activateLsp(false)
    } catch (err) {
      console.error(err)
      throw new Error(err)
    }
  }
  // start the Flutter Daemon
  startFlutterDeamon()
  Info.reload()
}

export async function deactivate() {
  if (state.client) await deactivateLsp()
  if (state.editorSubs) await cancelSubs(state.editorSubs)
  if (state.lspSubs) await cancelSubs(state.lspSubs)
  await stopProcess(state.daemon, "kill")
  await cancelSubs(state.globalSubs)
}
