import { wrapCommand } from "../utils/utils"

export const registerOpenEmulator = () => {
  return nova.commands.register(
    "sciencefidelity.dart.commands.openEmulator",
    wrapCommand(openEmulator)
  )
}

// Find the name of the avd
// TODO: Open an alert to let the user choose an avd
const openEmulator = async () => {
  return new Promise((resolve, reject) => {
    const process = new Process("/usr/bin/env", {
      args: ["emulator", "-list-avds"],
      stdio: ["ignore", "pipe", "ignore"]
    })
    process.onStdout(async line => {
      await openAvd(line)
    })
    process.onDidExit(status => {
      if (status === 0) {
        resolve()
      } else {
        reject(status)
      }
    })
    process.start()
  }) as Promise<void>
}

// Opens the Android Emulator
const openAvd = async (line: string) => {
  return new Promise((resolve, reject) => {
    const avdName = line.trim()
    const process = new Process("/usr/bin/env", {
      args: ["emulator", "-avd", avdName],
      stdio: ["ignore", "ignore", "pipe"]
    })
    process.onDidExit(status => {
      if (status === 0) {
        resolve()
      } else {
        reject(status)
      }
    })
    console.log(`Opening ${avdName}`)
    process.start()
  }) as Promise<void>
}
