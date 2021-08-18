import { cleanPath } from "nova-extension-utils"
import { state } from "./globalVars"
import { makeFileExecutable } from "./utils/utils"

export class FlutterDaemonService {
  process: Process | null

  constructor() {
    this.pid = null
    this.process = null
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
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
        p.onDidExit((status) => (status === 0 ? resolve() : reject()))
        p.start()
      })
      console.log("logging to", logDir)
      const outLog = nova.path.join(logDir, "app.log")
      _args = ["bash", "-c", `"${daemonFile}" | tee "${outLog}"`]
      _env = {
        WORKSPACE_DIR: `${cleanPath(nova.workspace.path!)}/test-workspace` ?? "",
      }
    }

    const daemon = new Process("/usr/bin/env", {
      args: _args,
      env: _env,
      stdio: "jsonrpc"
    })

    this.process = daemon

    this.process.onDidExit(() => {
      console.log("Daemon terminated")
    })
    this.process.start()
    state.daemonSubs = new CompositeDisposable()
    state.daemonSubs.add(registerGetDaemonVersion())
  }

  stop() {
    console.log("Daemon stopping")
  }
}
