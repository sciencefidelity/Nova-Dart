import { daemon, startFlutterDeamon } from "./startFlutterDaemon"
import { DartColorAssistant } from "./colors"
import { informationView } from "./informationView"
import { registerFlutterRun, registerFlutterStop } from "./commands/flutterRun"
import { registerOpenSimulator } from "./commands/openSimulartor"
import { registerOpenEmulator } from "./commands/openEmulator"
import { registerGetDependencies } from "./commands/getDependencies"
import { registerGetDaemonVersion } from "./commands/getDaemonVersion"
import { wrapCommand } from "./utils/novaUtils"
import { getDartVersion, getFlutterVersion } from "./utils/getVersions"
import { activateLsp } from "./activateLsp"
import { client } from "./activateLsp"

// Colors
const Colors = new DartColorAssistant()
nova.assistants.registerColorAssistant(["dart"], Colors)

nova.commands.register(
  "sciencefidelity.dart.openWorkspaceConfig",
  wrapCommand(function openWorkspaceConfig(workspace: Workspace) {
    workspace.openConfig()
  })
)

const reload = async () => {
  if (
    nova.config.get("sciencefidelity.dart.config.enableAnalyzer", "boolean")
  ) {
    deactivate()
    console.log("reloading...")
    await activateLsp()
  }
}

nova.commands.register("sciencefidelity.dart.reload", reload)

export const compositeDisposable = new CompositeDisposable()

nova.config.onDidChange(
  "sciencefidelity.dart.config.enableAnalyzer",
  async current => {
    if (current) {
      activate()
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

export const deactivate = () => {
  daemon?.terminate()
  client?.stop()
  compositeDisposable.dispose()
}
