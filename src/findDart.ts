import { makeFileExecutable } from "./novaUtils"

const findDartFile = nova.path.join(nova.extension.path, "findDart.sh")
makeFileExecutable(findDartFile)

export const findDart = async () => {
  return new Promise<string | null>((resolve, reject) => {
    const find = new Process("/usr/bin/env", {
      args: ["zsh", "-c", `"${findDartFile}"`],
      stdio: ["ignore", "pipe", "ignore"]
    })
    let analyzerPath: string | null = null
    find.onStdout(async function (line) {
      analyzerPath = line
    })
    find.onDidExit(status => {
      if (status === 0) {
        resolve(analyzerPath)
      } else {
        reject(status)
      }
    })
    find.start()
  })
}
