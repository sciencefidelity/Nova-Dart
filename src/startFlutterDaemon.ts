export let daemon: Process | null = null

export const startFlutterDeamon = async () => {
  return new Promise(() => {
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
    daemon.onNotify("daemon/connected", message => {
      console.log(JSON.stringify(message.result))
      console.log(JSON.stringify(message.errorReason))
    })
    daemon.start()
  }).then(function () {
    console.log("Daemon started")
  })
}
