import { cleanPath } from "nova-extension-utils"
import { keys, state, vars } from "../globalVars"
import { stopProcess, wrapCommand } from "../utils/utils"

// interface Message {
//   event?: string
//   params?: {
//     appId: string
//     deviceId: string
//     directory: string
//     supportsRestart: boolean
//     launchMode: string
//   }
// }

export function registerFlutterRun() {
  return nova.commands.register(keys.flutterRun, wrapCommand(flutterRun))
}

function registerFlutterStop() {
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
    state.runProcess = new Process("usr/bin/env", {
      args: ["flutter", "run", "--machine"],
      cwd: path,
      stdio: "jsonrpc"
    })
    // let obj: Message = {}
    // state.runProcess.onStdout(line => {
    //   if (line.charAt(0) === "[") {
    //     obj = JSON.parse(line.trim().slice(1, line.length - 2))
    //     obj.params?.appId && (vars.appId = obj.params.appId)
    //     vars.appId && console.log(`App ID: ${vars.appId}`)
    //   }
    // })
    state.runProcess.onNotify("app.start", message => {
      console.log(message.result)
      vars.appId = message.result.params.appId
    })
    state.runProcess.onDidExit(status => {
      console.log("Exiting")
      status === 0 ? resolve() : reject(status)
    })
    state.runProcess.start()
    state.runSubs = new CompositeDisposable()
    state.runSubs.add(registerFlutterStop())
  })
}

async function flutterStop() {
  return new Promise<void>(() => {
    console.log(vars.appId)
    const method = "app.stop"
    const params = {appId: `${vars.appId}`}
    state.runProcess?.request(method, params)
  }).then(reply => {
    console.log(reply)
    vars.appId = undefined
    stopProcess(state.runProcess, "kill")
  })
}
