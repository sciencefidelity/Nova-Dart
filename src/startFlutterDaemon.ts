import { state } from "./globalVars"

export async function startFlutterDeamon () {
  return new Promise<void>((resolve, reject) => {
    if (nova.inDevMode()) {
      const daemonNotification = new NotificationRequest("daemon activated")
      daemonNotification.body = "Flutter Daemon is loading"
      nova.notifications.add(daemonNotification)
    }
    console.log("Flutter Daemon is loading")
    // let message
    state.daemon = new Process("/usr/bin/env", {
      args: ["flutter", "daemon"],
      stdio: "jsonrpc"
    })
    state.daemon.onNotify("daemon.connected", message => {
      console.log(message)
    })
    state.daemon.onDidExit(status => {
      status === 0 ? resolve() : reject(status)
    })
    state.daemon.start()
  })
}
