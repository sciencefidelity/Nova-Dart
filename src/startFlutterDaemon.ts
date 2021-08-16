import { state } from "./globalVars"
import { registerGetDaemonVersion } from "./commands/getDaemonVersion"

export async function startFlutterDeamon() {
  return new Promise<void>((resolve, reject) => {
    if (nova.inDevMode()) {
      const daemonNotification = new NotificationRequest("daemon activated")
      daemonNotification.body = "Flutter Daemon is loading"
      nova.notifications.add(daemonNotification)
    }
    console.log("Loading Flutter Daemon")
    // let message
    state.daemon = new Process("/usr/bin/env", {
      args: ["flutter", "daemon"],
      stdio: "jsonrpc"
    })
    state.daemon.onDidExit(status => {
      status === 0 ? resolve() : reject(status)
    })
    state.daemon.start()
    state.daemonSubs = new CompositeDisposable()
    state.daemonSubs.add(registerGetDaemonVersion())
  })
}
