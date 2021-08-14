import { keys } from "../globalVars"
import { wrapCommand } from "../utils/utils"

export function registerOpenEmulator() {
  return nova.commands.register(keys.openEmulator, wrapCommand(openEmulator))
}

// Find the name of the avd
// TODO: Open an alert to let the user choose an avd
async function openEmulator() {
  return new Promise<void>((resolve, reject) => {
    const process = new Process("/usr/bin/env", {
      args: ["emulator", "-list-avds"],
      stdio: ["ignore", "pipe", "ignore"]
    })
    process.onStdout(async line => {
      await openAvd(line)
    })
    process.onDidExit(status => {
      status === 0 ? resolve() : reject(status)
    })
    process.start()
  })
}

// Opens the Android Emulator
async function openAvd(line: string) {
  return new Promise<void>((resolve, reject) => {
    const avdName = line.trim()
    const process = new Process("/usr/bin/env", {
      args: ["emulator", "-avd", avdName],
      stdio: ["ignore", "ignore", "pipe"]
    })
    process.onDidExit(status => {
      status === 0 ? resolve() : reject(status)
    })
    console.log(`Opening ${avdName}`)
    process.start()
  })
}
