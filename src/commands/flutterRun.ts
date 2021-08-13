import { cleanPath } from "nova-extension-utils"
import { wrapCommand } from "../utils/utils"
import { state, keys } from "../globalVars"

export function registerFlutterRun() {
  return nova.commands.register(keys.flutterRun, wrapCommand(flutterRun))
}

export function registerFlutterStop() {
  return nova.commands.register(keys.flutterStop, wrapCommand(flutterStop))
}

function flutterRun() {
  return new Promise((resolve, reject) => {
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
      console.log(JSON.stringify(line))
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

function flutterStop() {
  return new Promise((resolve, reject) => {
    state.daemon?.request("app.stop").then(function (response) {
      console.log(JSON.parse(response))
    })
    state.daemon?.onDidExit(status => {
      if (status === 0) {
        resolve()
      } else {
        reject(status)
      }
    })
  }) as Promise<void>
}
