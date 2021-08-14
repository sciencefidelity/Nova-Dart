import { keys } from "../globalVars"
import { makeFileExecutable } from "./utils"

const findDartFile = nova.path.join(nova.extension.path, "findDart.sh")
let path: string | null = null

export async function findDartPath() {
  path = nova.config.get(keys.analyzerPath, "string")
  if (path) return path
  try {
    return (path = await findDart())
  } catch (err) {
    return err
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
      status === 0
        ? reslove(analyzerPath)
        : reject("Path to Dart Analyzer not found, please add it in the config.")
    })
    find.start()
  })
}
