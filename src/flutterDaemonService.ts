import { state } from "./globalVars"

export class FlutterDaemonService {
  process: Process | null

  constructor() {
    this.pid = null
    this.process = null
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
  }

  start() {
    if (nova.inDevMode()) {
      const daemonNotification = new NotificationRequest("daemon activated")
      daemonNotification.body = "Flutter Daemon is loading"
      nova.notifications.add(daemonNotification)
    }
    console.log("Loading Flutter Daemon")

    const daemon = new Process("/usr/bin/env", {
      args: ["flutter", "daemon"],
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
