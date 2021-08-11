import { wrapCommand } from "../novaUtils"

export function registerGetDependencies() {
  return nova.commands.register(
    "sciencefidelity.dart.commands.getDependencies",
    wrapCommand(getDependencies)
  )

  // Fetch dependencies
  // eslint-disable-next-line no-unused-vars
  async function getDependencies(): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = new Process("/usr/bin/env", {
        args: ["flutter", "pub", "get"],
        stdio: ["pipe", "pipe", "pipe"]
      })
      process.onStdout(() => {
        console.log("Fetching Dependencies")
        const notification = new NotificationRequest("dependencies")
        notification.body = "Fetching Dependencies"
        nova.notifications.add(notification)
      })
      process.onDidExit(status => {
        if (status === 0) {
          resolve()
        } else {
          reject(status)
        }
      })
      process.start()
    })
  }
}
