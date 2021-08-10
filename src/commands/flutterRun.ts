import { cleanPath } from "nova-extension-utils"
import { wrapCommand } from "../novaUtils"
import { daemon } from "../startFlutterDaemon"

// let appId: string | null

export function registerFlutterRun() {
  return nova.commands.register(
    "sciencefidelity.dart.commands.flutterRun",
    wrapCommand(flutterRun)
  )

  async function flutterRun(): Promise<void>
  async function flutterRun() {
    return new Promise(() => {
      let path

      if (nova.inDevMode() && nova.workspace.path) {
        path = `${cleanPath(nova.workspace.path)}/test-workspace`
      } else if (nova.workspace.path) {
        path = cleanPath(nova.workspace.path)
      }
      const process = new Process("usr/bin/env", {
        args: ["flutter", "run", "--machine"],
        cwd: path,
        stdio: ["ignore", "pipe", "ignore"]
      })
      process.onStdout(line => {
        // const arr: AppStart = JSON.parse(line)
        // const id: string = arr.params.appId
        // console.log(id)
        console.log(JSON.stringify(line))
      })
      process.start()
    })
  }
}

export function registerFlutterStop() {
  return nova.commands.register(
    "sciencefidelity.dart.commands.flutterStop",
    wrapCommand(flutterStop)
  )

  async function flutterStop(): Promise<void>
  async function flutterStop() {
    return new Promise((resolve, reject) => {
      daemon?.request("app.stop").then(function (response) {
        console.log(JSON.parse(response))
      })
      const str = ""
      daemon?.onDidExit(status => {
        if (status === 0) {
          resolve(str)
        } else {
          reject(status)
        }
      })
    })
  }
}
