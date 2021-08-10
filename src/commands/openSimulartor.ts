import { wrapCommand } from "../novaUtils"

export function registerOpenSimulator() {
  return nova.commands.register(
    "sciencefidelity.dart.commands.openSimulator",
    wrapCommand(openSimulator)
  )

  // Opens the iOS Simulator
  async function openSimulator(): Promise<void>
  async function openSimulator() {
    return new Promise((resolve, reject) => {
      const process = new Process("/usr/bin/env", {
        args: ["open", "-a", "Simulator"],
        stdio: ["ignore", "ignore", "pipe"]
      })
      const str = ""
      process.onDidExit(status => {
        if (status === 0) {
          resolve(str)
        } else {
          reject(status)
        }
      })
      process.start()
    })
  }
}
