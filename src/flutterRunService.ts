import { cleanPath } from "nova-extension-utils"
import { keys, state, vars } from "./globalVars"
import { makeFileExecutable, wrapCommand } from "./utils/utils"
import { Message } from "./interfaces/interfaces"

let path: string
if (nova.inDevMode() && nova.workspace.path) {
  path = `${cleanPath(nova.workspace.path)}/test-workspace`
} else if (nova.workspace.path) {
  path = cleanPath(nova.workspace.path)
}

export class FlutterRunService {
  appId: string | undefined
  path: string
  pid: number | null
  process: Process | null
  wsUri: string | undefined

  constructor() {
    this.appId = undefined
    this.path = path
    this.pid = null
    this.process = null
    this.reload = this.reload.bind(this)
    this.run = this.run.bind(this)
    this.stop = this.stop.bind(this)
    this.wsUri = undefined
  }

  async run() {
    console.log("Running app")

    let _args = ["flutter", "run", "--machine"]
    let _env = {}
    // log daemon output in dev mode
    if (nova.inDevMode()) {
      const appFile = nova.path.join(nova.extension.path, "app.sh")
      await makeFileExecutable(appFile)
      const logDir = nova.path.join(nova.workspace.path!, "logs")
      await new Promise<void>((resolve, reject) => {
        const p = new Process("/usr/bin/env", {
          args: ["mkdir", "-p", logDir]
        })
        p.onDidExit(status => (status === 0 ? resolve() : reject()))
        p.start()
      })
      console.log("Logging to", logDir + "/app.log")
      const outLog = nova.path.join(logDir, "app.log")
      _args = ["bash", "-c", `"${appFile}" | tee "${outLog}"`]
      _env = {
        WORKSPACE_DIR: `${cleanPath(nova.workspace.path!)}/test-workspace` ?? ""
      }
    }

    this.process = new Process("usr/bin/env", {
      args: _args,
      env: _env,
      cwd: this.path,
      stdio: "pipe"
    })
    // this.process = client
    this.process.onStdout(line => {
      if (line.charAt(0) === "[") {
        const obj: Message = JSON.parse(line.trim().slice(1, line.length - 2))
        if (obj.event === "daemon.connected") {
          obj.params && (vars.runPid = obj.params.pid)
          console.log(`pid: ${vars.runPid}`)
        }
        if (obj.event === "app.debugPort") {
          obj.params && (vars.wsUri = obj.params.wsUri)
          console.log(`wsUri: ${vars.wsUri}`)
        }
        if (obj.event === "app.started") {
          obj.params && (vars.appId = obj.params.appId)
          console.log(`appId: ${vars.appId}`)
        }
      }
    })
    // this.process.onNotify("app.connected", message => {
    //   console.log("Pid message")
    //   console.log(message.result)
    //   this.wsUri = message.result.params.wsUri
    // })
    // this.process.onNotify("app.started", message => {
    //   console.log("Started message")
    //   console.log(message.result)
    //   this.appId = message.result.params.appId
    // })
    // this.process.onNotify("app.debugPort", message => {
    //   console.log("Port message")
    //   console.log(message.result)
    //   this.wsUri = message.result.params.wsUri
    // })
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
    console.log("Stopping app")
    // const method = "app.stop"
    // const params = { appId: "1be70571-831b-431a-b239-9bf8cb418677" }
    // this.process?.request(method, params).then(reply => {
    //   console.log(reply)
    //   this.appId = undefined
    // })
    this.process!.terminate()
    // if (this.process) {
    //   this.process.terminate()
    // } else {
    //   console.log("App not running")
    // }
    nova.commands.register(keys.flutterRun, wrapCommand(flutterRun))
  }

  reload() {
    console.log("Reloading")
    // const method = "app.restart"
    // const params = { appId: "1be70571-831b-431a-b239-9bf8cb418677" }
    // this.process?.request(method, params).then(reply => {
    //   console.log(reply)
    //   this.appId = undefined
    // })
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
