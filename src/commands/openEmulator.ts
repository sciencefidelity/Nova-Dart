import { wrapCommand } from "../novaUtils"

export function registerOpenEmulator() {
  return nova.commands.register(
    "sciencefidelity.dart.commands.openEmulator",
    wrapCommand(openEmulator)
  )

  // Find the name of the avd
  async function openEmulator(): Promise<void>
  // TODO: Open an alert to let the user choose an avd
  async function openEmulator() {
    return new Promise(() => {
      const process = new Process("/usr/bin/env", {
        args: ["emulator", "-list-avds"],
        stdio: ["ignore", "pipe", "ignore"]
      })
      process.onStdout(async function (line) {
        await openAvd(line)
      })
      process.start()
    })
  }
}

// Opens the Android Emulator
async function openAvd(line: string) {
  return new Promise((resolve, reject) => {
    const avdName = line.trim()
    const process = new Process("/usr/bin/env", {
      args: ["emulator", "-avd", avdName],
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
