import { wrapCommand } from "../novaUtils"

export const registerOpenEmulator = () => {
  return nova.commands.register(
    "sciencefidelity.dart.commands.openEmulator",
    wrapCommand(openEmulator)
  )

  // Find the name of the avd
  // TODO: Open an alert to let the user choose an avd
  async function openEmulator(): Promise<void> {
    return new Promise(() => {
      const process = new Process("/usr/bin/env", {
        args: ["emulator", "-list-avds"],
        stdio: ["ignore", "pipe", "ignore"]
      })
      process.onStdout(async line => {
        await openAvd(line)
      })
      process.start()
    })
  }
}

// Opens the Android Emulator
const openAvd = async (line: string): Promise<void> => {
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
    process.start()
  })
}
