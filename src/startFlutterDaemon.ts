import { state } from "./main"

export async function startFlutterDeamon () {
  // eslint-disable-next-line no-unused-vars
  return new Promise((_resolve, _reject) => {
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
    state.daemon.start()
  })
}
