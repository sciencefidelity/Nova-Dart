import { cleanPath } from "nova-extension-utils"
import { keys, state } from "../globalVars"
import { wrapCommand } from "../utils/utils"

export function registerFlutterRun() {
  return nova.commands.register(keys.flutterRun, wrapCommand(flutterRun))
}

export function registerFlutterStop() {
  return nova.commands.register(keys.flutterStop, wrapCommand(flutterStop))
}

function flutterRun() {
  return new Promise<void>((resolve, reject) => {
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
      status === 0 ? resolve() : reject(status)
    })
    process.start()
  })
}

function flutterStop() {
  return new Promise<void>((resolve, reject) => {
    state.daemon?.request("app.stop").then(function (response) {
      console.log(JSON.parse(response))
    })
    state.daemon?.onDidExit(status => {
      status === 0 ? resolve() : reject(status)
    })
  })
}
