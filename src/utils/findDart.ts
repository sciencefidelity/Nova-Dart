import { makeFileExecutable } from "./novaUtils"

const findDartFile = nova.path.join(nova.extension.path, "findDart.sh")
makeFileExecutable(findDartFile)

export const findDart = () => {
  return new Promise<string | null>((resolve, reject) => {
    const find = new Process("/usr/bin/env", {
      args: ["zsh", "-c", `"${findDartFile}"`],
      stdio: ["ignore", "pipe", "pipe"]
    })
    let analyzerPath: string | null = null
    find.onStdout(line => {
      analyzerPath = line
    })
    find.onStderr(line => {
      console.log(line)
    })
    find.onDidExit(status => {
      if (status === 0) {
        resolve(analyzerPath)
      } else {
        reject("Dart Analyzer not found, please add the path in the plugin config.")
      }
    })
    find.start()
  })
}
