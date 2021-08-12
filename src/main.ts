import { startFlutterDeamon } from "./startFlutterDaemon"
import { DartColorAssistant } from "./colors"
import { informationView } from "./informationView"
import { registerFlutterRun, registerFlutterStop } from "./commands/flutterRun"
import { registerOpenSimulator } from "./commands/openSimulartor"
import { registerOpenEmulator } from "./commands/openEmulator"
import { registerGetDependencies } from "./commands/getDependencies"
import { registerGetDaemonVersion } from "./commands/getDaemonVersion"
import { wrapCommand } from "./utils/utils"
import { getDartVersion, getFlutterVersion } from "./utils/getVersions"
import { activateLsp, reloadLsp, deactivateLsp } from "./activateLsp"
import { stopProcess } from "./utils/utils"
import { cancelSubscriptions } from "./manageSubscriptions"

export const keys = {
  enableAnalyzer: "sciencefidelity.dart.config.enableAnalyzer",
  formatDocument: "sciencefidelity.dart.commands.formatDocument",
  formatDocumentOnSave: "sciencefidelity.dart.config.formatDocumentOnSave",
  openWorkspaceConfig: "sciencefidelity.dart.openWorkspaceConfig",
  reloadLsp: "sciencefidelity.dart.reloadLsp"
}

export const state = {
  client: null as LanguageClient | null,
  daemon: null as Process | null,
  subscriptions: null as CompositeDisposable | null
}

export const vars = {
  syntaxes: ["dart"] as string[]
}

// Resgister subscriptions class
state.subscriptions = new CompositeDisposable()

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

nova.commands.register(keys.reloadLsp, reloadLsp)

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

  // register nova commands
  state.subscriptions?.add(registerFlutterRun())
  state.subscriptions?.add(registerFlutterStop())
  state.subscriptions?.add(registerOpenSimulator())
  state.subscriptions?.add(registerOpenEmulator())
  state.subscriptions?.add(registerGetDaemonVersion())
  state.subscriptions?.add(registerGetDependencies())
  state.subscriptions?.add(informationView)

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

  startFlutterDeamon()
  informationView.reload()
}

export async function deactivate() {
  await stopProcess(state.daemon)
  await deactivateLsp()
  await cancelSubscriptions()
}
