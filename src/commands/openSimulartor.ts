import { wrapCommand } from "../utils/utils"
import { keys } from "../main"

export function registerOpenSimulator() {
  return nova.commands.register(keys.openSimulator, wrapCommand(openSimulator))
}

// Opens the iOS Simulator
function openSimulator() {
  return new Promise<void>((resolve, reject) => {
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
    console.log("Opening iOS Simulator")
    process.start()
  })
}
