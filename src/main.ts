import { startFlutterDeamon } from "./startFlutterDaemon"
import { DartColorAssistant } from "./colors"
import { informationView } from "./informationView"
import { registerFlutterRun, registerFlutterStop } from "./commands/flutterRun"
import { registerOpenSimulator } from "./commands/openSimulartor"
import { registerOpenEmulator } from "./commands/openEmulator"
import { registerGetDependencies } from "./commands/getDependencies"
import { registerGetDaemonVersion } from "./commands/getDaemonVersion"
import { wrapCommand } from "./utils/novaUtils"
import { getDartVersion, getFlutterVersion } from "./utils/getVersions"
import { activateLsp, reloadLsp, deactivateLsp } from "./activateLsp"
import { stopProcess } from "./utils/utils"

export const state = {
  client: null as LanguageClient | null,
  daemon: null as Process | null
}

// Start color assistant
const Colors = new DartColorAssistant()
nova.assistants.registerColorAssistant(["dart"], Colors)

// Register command to open workspace config
nova.commands.register(
  "sciencefidelity.dart.openWorkspaceConfig",
  wrapCommand(function openWorkspaceConfig(workspace: Workspace) {
    workspace.openConfig()
  })
)

nova.commands.register("sciencefidelity.dart.reload", reloadLsp)

export const compositeDisposable = new CompositeDisposable()

nova.config.onDidChange(
  "sciencefidelity.dart.config.enableAnalyzer",
  async current => {
    if (current) {
      activateLsp()
    } else {
      deactivate()
    }
  }
)

export const activate = async () => {
  console.log("activating...")

  // register nova commands
  compositeDisposable.add(registerFlutterRun())
  compositeDisposable.add(registerFlutterStop())
  compositeDisposable.add(registerOpenSimulator())
  compositeDisposable.add(registerOpenEmulator())
  compositeDisposable.add(registerGetDaemonVersion())
  compositeDisposable.add(registerGetDependencies())
  compositeDisposable.add(informationView)

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
    nova.config.get("sciencefidelity.dart.config.enableAnalyzer", "boolean")
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

export const deactivate = async () => {
  await stopProcess(state.daemon)
  await deactivateLsp()
  compositeDisposable.dispose()
}
