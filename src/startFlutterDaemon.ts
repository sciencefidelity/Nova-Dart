export let daemon: Process | null = null

export const startFlutterDeamon = async () => {
  return new Promise<void>((resolve, reject) => {
    if (nova.inDevMode()) {
      const daemonNotification = new NotificationRequest("daemon activated")
      daemonNotification.body = "Flutter Daemon is loading"
      nova.notifications.add(daemonNotification)
    }
    console.log("Flutter Daemon is loading")
    daemon = new Process("/usr/bin/env", {
      args: ["flutter", "daemon"],
      stdio: "jsonrpc"
    })
    daemon.onNotify("daemon.connected", message => {
      console.log(JSON.stringify(message.result))
      console.error(JSON.stringify(message.errorReason))
    })
    daemon.onDidExit(status => {
      if (status === 0) {
        resolve()
      } else {
        reject(status)
      }
    })
    daemon.start()
  })
}
