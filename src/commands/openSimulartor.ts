import { wrapCommand } from "../utils/novaUtils"

export const registerOpenSimulator = () => {
  return nova.commands.register(
    "sciencefidelity.dart.commands.openSimulator",
    wrapCommand(openSimulator)
  )
}

// Opens the iOS Simulator
const openSimulator = () => {
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
    console.log("Opening iOS Simulator")
    process.start()
  }) as Promise<void>
}
