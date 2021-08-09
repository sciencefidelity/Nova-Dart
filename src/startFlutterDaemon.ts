export let daemon: Process | null = null;

export async function startFlutterDeamon() {
  return new Promise((resolve, reject) => {
    if (nova.inDevMode()) {
      const notification = new NotificationRequest("activated");
      notification.body = "Flutter Daemon is loading";
      nova.notifications.add(notification);
    }
    daemon = new Process("/usr/bin/env", {
      args: ["flutter", "daemon"],
      stdio: "jsonrpc"
    });
    const str = "";
    daemon.onDidExit(status => {
      if (status === 0) {
        resolve(str);
      } else {
        reject(status);
      }
    });
    daemon.start();
  });
}
