import { keys } from "../globalVars"
import { makeFileExecutable } from "./utils"

const findDartFile = nova.path.join(nova.extension.path, "findDart.sh")
let path: string | null = null

export async function findDartPath(): Promise<string | null> {
  path = nova.config.get(keys.analyzerPath, "string")
  if (path) {
    path = path.replace(/(analysis_server.dart.snapshot)$/, '')
    path = path.replace(/\/$/, '')
    return `${path}/analysis_server.dart.snapshot`
  } else {
    const notification = new NotificationRequest("pathNotFound")
    notification.body = "Path to Dart Analysys Server not found.\n\nPlease add the full path in the extension preferences."
    nova.notifications.add(notification)
    return ""
  }
}

async function findDart() {
  return new Promise<string | null>((reslove, reject) => {
    makeFileExecutable(findDartFile)
    const find = new Process("/usr/bin/env", {
      args: ["zsh", "-c", `"${findDartFile}"`],
      stdio: ["ignore", "pipe", "pipe"]
    })
    let analyzerPath: string | null = null
    find.onStdout(line => {
      analyzerPath = line
    })
    find.onStderr(() => {
      throw new Error("Dart Analyzer not found.")
    })
    // prettier-ignore
    find.onDidExit(status => {
      status === 0 && typeof analyzerPath === "string"
        ? reslove(analyzerPath)
        : reject("Path to Dart Analyzer not found, please add it in the config.")
    })
    find.start()
  })
}
