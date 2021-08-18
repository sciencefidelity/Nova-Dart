import { cleanPath } from "nova-extension-utils"
import { keys, state, vars } from "./globalVars"
import { makeFileExecutable, wrapCommand } from "./utils/utils"
import { Message } from "./interfaces/interfaces"

export class FlutterDaemonService {
  process: Process | null
  constructor() {
    this.process = null
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this.version = this.version.bind(this)
  }

  async start() {
    console.log("Loading Flutter Daemon")
    let _args = ["flutter", "daemon"]
    let _env = {}
    if (nova.inDevMode()) {
      const daemonNotification = new NotificationRequest("daemon activated")
      daemonNotification.body = "Flutter Daemon is loading"
      nova.notifications.add(daemonNotification)
      // create logs in dev mode
      const daemonFile = nova.path.join(nova.extension.path, "daemon.sh")
      await makeFileExecutable(daemonFile)
      const logDir = nova.path.join(nova.workspace.path!, "logs")
      await new Promise<void>((resolve, reject) => {
        const p = new Process("/usr/bin/env", {
          args: ["mkdir", "-p", logDir]
        })
        p.onDidExit(status => (status === 0 ? resolve() : reject()))
        p.start()
      })
      console.log("logging to", logDir)
      const outLog = nova.path.join(logDir, "daemon.log")
      _args = ["bash", "-c", `"${daemonFile}" | tee "${outLog}"`]
      _env = {
        WORKSPACE_DIR: `${cleanPath(nova.workspace.path!)}/test-workspace` ?? ""
      }
    }

    const daemon = new Process("/usr/bin/env", {
      args: _args,
      env: _env,
      stdio: "jsonrpc"
    })
    this.process = daemon
    let obj: Message = {}
    this.process.onStdout(line => {
      if (line.startsWith("[{") && line.endsWith("}]")) {
        obj = JSON.parse(line.trim().slice(1, line.length - 2))
        obj.params && (vars.daemonPid = obj.params.pid)
        console.log(`Pid: ${vars.daemonPid}`)
      }
    })
    this.process.onDidExit(() => {
      console.log("Daemon terminated")
    })
    state.daemonSubs = new CompositeDisposable()
    nova.commands.register(keys.getDaemonVersion, wrapCommand(this.version))
    this.process.start()
  }

  stop() {
    console.log("Daemon stopping")
    this.process?.terminate()
  }

  version() {
    console.log("Getting Daemon version")
  }
}
