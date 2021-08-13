import { activateLsp, deactivateLsp, reloadLsp } from "./activateLsp"
import { DartColorAssistant } from "./colors"
import { registerFlutterRun, registerFlutterStop } from "./commands/flutterRun"
import { registerGetDaemonVersion } from "./commands/getDaemonVersion"
import { registerGetDependencies } from "./commands/getDependencies"
import { registerOpenEmulator } from "./commands/openEmulator"
import { registerOpenSimulator } from "./commands/openSimulartor"
import { keys, state } from "./globalVars"
import { informationView } from "./informationView"
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
nova.config.onDidChange(
  keys.enableAnalyzer,
  async current => {
    if (current) {
      activateLsp()
    } else {
      deactivateLsp()
    }
  }
)

export async function activate() {
  console.log("activating...")
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
  state.globalSubscriptions?.add(informationView)
  // get installed Dart and Flutter versions
  try {
    const dartVersion = await getDartVersion()
    informationView.dartVersion = dartVersion
  } catch {
    console.log("Dart version not found")
  }
  try {
    const flutterVersion = await getFlutterVersion()
    informationView.flutterVersion = flutterVersion
  } catch {
    console.log("Flutter version not found")
  }
  // start the LSP server
  if (
    nova.config.get(keys.enableAnalyzer, "boolean")
  ) {
    if (nova.inDevMode()) {
      const notification = new NotificationRequest("activated")
      notification.body = "Dart LSP is loading"
      nova.notifications.add(notification)
    }
    try {
      await activateLsp()
      console.log("LSP Activated")
    } catch (err) {
      console.error("Failed to activate LSP")
      console.error(err)
      nova.workspace.showErrorMessage(err)
    }
  }
  // start the Flutter Daemon
  startFlutterDeamon()
  informationView.reload()
}

export async function deactivate() {
  await cancelSubscriptions(state.editorSubscriptions)
  await cancelSubscriptions(state.lspSubscriptions)
  await deactivateLsp()
  await stopProcess(state.daemon)
  await cancelSubscriptions(state.globalSubscriptions)
}
