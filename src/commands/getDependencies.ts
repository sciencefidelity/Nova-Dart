import { keys } from "../globalVars"
import { wrapCommand } from "../utils/utils"

export function registerGetDependencies() {
  return nova.commands.register(
    keys.getDependencies,
    wrapCommand(getDependencies)
  )
}

// Fetch dependencies
// eslint-disable-next-line no-unused-vars
function getDependencies() {
  return new Promise<void>((resolve, reject) => {
    console.log("Getting dependencies")
    let cwd = nova.workspace.path!
    if (nova.inDevMode())
      cwd = nova.path.join(nova.workspace.path!, "test-workspace")
    const process = new Process("/usr/bin/env", {
      args: ["flutter", "pub", "get"],
      cwd: cwd,
      stdio: ["ignore", "pipe", "pipe"]
    })
    process.onStdout(line => {
      console.log(line)
    })
    process.onStderr(line => {
      console.log(line)
    })
    process.onDidExit(status => {
      status === 0 ? resolve() : reject(status)
    })
    console.log("Fetching dependencies")
    const dependencyNotification = new NotificationRequest("dependencies")
    // prettier-ignore
    dependencyNotification.body = "Fetching dependencies. \nMore info is in the extension console."
    nova.notifications.add(dependencyNotification)
    process.start()
  })
}
