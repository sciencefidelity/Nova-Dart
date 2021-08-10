import { wrapCommand } from "../novaUtils"

export function registerGetDependencies() {
  return nova.commands.register(
    "sciencefidelity.dart.commands.getDependencies",
    wrapCommand(getDependencies)
  )

  // Fetch dependencies
  // eslint-disable-next-line no-unused-vars
  async function getDependencies(): Promise<void>
  async function getDependencies() {
    return new Promise((resolve, reject) => {
      const process = new Process("/usr/bin/env", {
        args: ["flutter", "pub", "get"],
        stdio: ["pipe", "pipe", "pipe"]
      })
      const str = ""
      process.onStdout(function () {
        console.log("Fetching Dependencies")
        const notification = new NotificationRequest("dependencies")
        notification.body = "Fetching Dependencies"
        nova.notifications.add(notification)
      })
      process.onDidExit(status => {
        if (status === 0) {
          console.log("Exited")
          resolve(str)
        } else {
          console.log("Failed")
          reject(status)
        }
      })
      process.start()
    })
  }
}
