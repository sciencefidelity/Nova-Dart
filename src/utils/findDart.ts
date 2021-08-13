import { makeFileExecutable } from "./utils"
import { keys } from "../globalVars"

const findDartFile = nova.path.join(nova.extension.path, "findDart.sh")
let path: string | null = null

export async function findDartPath() {
  path = nova.config.get(keys.analyzerPath, "string")
  if (path) {
    return path
  } else {
    try {
      return (path = await findDart())
    } catch (err) {
      return err
    }
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
    find.onDidExit(status => {
      if (status === 0) {
        reslove(analyzerPath)
      } else {
        // prettier-ignore
        reject("Dart Analyzer not found, please add the path in the plugin config.")
      }
    })
    find.start()
  })
}
