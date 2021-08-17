import { cleanPath } from "nova-extension-utils"
import { keys, state } from "./globalVars"
import { wrapCommand } from "./utils/utils"

let path: string
if (nova.inDevMode() && nova.workspace.path) {
  path = `${cleanPath(nova.workspace.path)}/test-workspace`
} else if (nova.workspace.path) {
  path = cleanPath(nova.workspace.path)
}

export class FlutterRunService {
  appId: string | undefined
  path: string
  process: Process | null

  constructor() {
    this.appId = undefined
    this.path = path
    this.process = null
    this.run = this.run.bind(this)
    this.stop = this.stop.bind(this)
    this.reload = this.reload.bind(this)
  }

  run() {
    console.log("Running app")
    const client = new Process("usr/bin/env", {
      args: ["flutter", "run", "--machine"],
      cwd: this.path,
      stdio: "jsonrpc"
    })
    this.process = client
    // this.process.onStdout(line => console.log(line))
    this.process.onNotify("app.start", message => {
      console.log(message.result)
      this.appId = message.result.params.appId
    })
    nova.commands.register(keys.flutterStop, wrapCommand(this.stop))
    nova.commands.register(keys.hotReload, wrapCommand(this.reload))
    nova.commands.register(keys.flutterRun, () =>
      console.log("App already running")
    )
    this.process.onDidExit(() => {
      console.log("Exiting")
    })
    this.process.start()
  }

  stop() {
    // const method = "app.stop"
    // const params = { appId: `${this.appId}` }
    // this.process?.request(method, params).then(reply => {
    //   console.log(reply)
    //   this.appId = undefined
    // })
    console.log("Stopping app")
    console.log(this.process)
    if (this.process) {
      this.process.kill()
    } else {
      console.log("App not running")
    }
    nova.commands.register(keys.flutterRun, wrapCommand(flutterRun))
  }

  reload() {
    console.log("Reloading")
    console.log(this.process)
  }
}

// prettier-ignore
export function registerFlutterRun() {
  nova.commands.register(
    keys.flutterStop,
    () => console.log("App not running")
  )
  nova.commands.register(
    keys.hotReload,
    () => console.log("App not running")
  )
  return nova.commands.register(
    keys.flutterRun,
    wrapCommand(flutterRun)
  )
}

function flutterRun() {
  state.flutterRunService = new FlutterRunService()
  state.flutterRunService.run()
}
