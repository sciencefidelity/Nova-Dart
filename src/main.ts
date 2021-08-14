import { activateLsp, deactivateLsp, reloadLsp } from "./activateLsp"
import { DartColorAssistant } from "./colors"
import { registerFlutterRun, registerFlutterStop } from "./commands/flutterRun"
import { registerGetDaemonVersion } from "./commands/getDaemonVersion"
import { registerGetDependencies } from "./commands/getDependencies"
import { registerOpenEmulator } from "./commands/openEmulator"
import { registerOpenSimulator } from "./commands/openSimulartor"
import { keys, state } from "./globalVars"
import { Information } from "./informationView"
import { cancelSubscriptions } from "./manageSubscriptions"
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
  if (current) {
    // false = "Activating..." | true = "Reloading..." in console
    activateLsp(false)
  } else {
    deactivateLsp()
  }
})

export async function activate() {
  // Resgister subscriptions
  if (state.globalSubscriptions) {
    state.globalSubscriptions.dispose()
  }
  state.globalSubscriptions = new CompositeDisposable()
  // register nova commands
  state.globalSubscriptions?.add(registerFlutterRun())
  state.globalSubscriptions?.add(registerFlutterStop())
  state.globalSubscriptions?.add(registerOpenSimulator())
  state.globalSubscriptions?.add(registerOpenEmulator())
  state.globalSubscriptions?.add(registerGetDaemonVersion())
  state.globalSubscriptions?.add(registerGetDependencies())
  state.globalSubscriptions?.add(Information)
  // get installed Dart and Flutter versions
  try {
    const dartVersion = await getDartVersion()
    Information.dartVersion = dartVersion
  } catch {
    console.log("Dart version not found")
  }
  try {
    const flutterVersion = await getFlutterVersion()
    Information.flutterVersion = flutterVersion
  } catch {
    console.log("Flutter version not found")
  }
  // start the LSP server
  // false = "Activating..." | true = "Reloading..." in console
  await activateLsp(false)
  // start the Flutter Daemon
  startFlutterDeamon()
  Information.reload()

}

export async function deactivate() {
  if (state.client) await deactivateLsp()
  if (state.editorSubscriptions)
    await cancelSubscriptions(state.editorSubscriptions)
  if (state.lspSubscriptions)
    await cancelSubscriptions(state.lspSubscriptions)
  await stopProcess(state.daemon, "kill")
  await cancelSubscriptions(state.globalSubscriptions)
}
