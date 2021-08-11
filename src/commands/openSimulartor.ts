import { wrapCommand } from "../novaUtils"

export const registerOpenSimulator = () => {
  return nova.commands.register(
    "sciencefidelity.dart.commands.openSimulator",
    wrapCommand(openSimulator)
  )

  // Opens the iOS Simulator
  async function openSimulator(): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = new Process("/usr/bin/env", {
        args: ["open", "-a", "Simulator"],
        stdio: ["ignore", "ignore", "pipe"]
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
