import { wrapCommand } from "../novaUtils"

export function registerGetDependencies() {
  return nova.commands.register(
    "sciencefidelity.dart.commands.getDependencies",
    wrapCommand(getDependencies)
  )
}

// Fetch dependencies
// eslint-disable-next-line no-unused-vars
const getDependencies = () => {
  return new Promise((resolve, reject) => {
    const process = new Process("/usr/bin/env", {
      args: ["flutter", "pub", "get"],
      stdio: ["ignore", "pipe", "ignore"]
    })
    process.onStdout(line => {
      console.log(line)
    })
    process.onDidExit(status => {
      if (status === 0) {
        console.log("Dependencies up to date")
        resolve()
      } else {
        reject(status)
      }
    })
    console.log("Fetching dependencies")
    const dependencyNotification = new NotificationRequest("dependencies")
    dependencyNotification.body = "Fetching dependencies"
    nova.notifications.add(dependencyNotification)
    process.start()
  }) as Promise<void>
}
