import { cleanPath } from "nova-extension-utils"
import { keys } from "./globalVars"
import { stopProcess, wrapCommand } from "./utils/utils"

let path: string
if (nova.inDevMode() && nova.workspace.path) {
  path = `${cleanPath(nova.workspace.path)}/test-workspace`
} else if (nova.workspace.path) {
  path = cleanPath(nova.workspace.path)
}

class FlutterRunService {
  appId: string | undefined
  path: string
  process: Process | null

  constructor() {
    this.appId = undefined
    this.path = path
    this.process = null
  }

  run() {
    this.process = new Process("usr/bin/env", {
      args: ["flutter", "run", "--machine"],
      cwd: this.path,
      stdio: "jsonrpc"
    })
    this.process.onNotify("app.start", message => {
      console.log(message.result)
      this.appId = message.result.params.appId
    })
    this.process.onDidExit(() => console.log("Exiting"))
    nova.commands.register(keys.flutterStop, wrapCommand(this.stop))
    this.process.start()
  }

  stop() {
    // const method = "app.stop"
    // const params = { appId: `${this.appId}` }
    // this.process?.request(method, params).then(reply => {
    //   console.log(reply)
    //   this.appId = undefined
    // })
    stopProcess(this.process, "kill")
    this.process?.onDidExit(() => console.log("Exiting"))
  }

  reload() {

  }
}

export function registerFlutterRun() {
  return nova.commands.register(keys.flutterRun, wrapCommand(flutterRun))
}

function flutterRun() {
  const runService = new FlutterRunService()
  runService.run()
}
