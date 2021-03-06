const re = /\b[0-9]*\.[0-9]*\.[0-9]*\b/

// Launches the Dart executable to determine its current version
export function getDartVersion() {
  return new Promise<string>((resolve, reject) => {
    const process = new Process("/usr/bin/env", {
      args: ["dart", "--version"],
      stdio: ["ignore", "ignore", "pipe"]
    })
    let str = ""
    process.onStderr(line => {
      const arr = line.match(re) ?? ["Unknown"]
      str = arr[0]
      console.log(line)
    })
    process.onDidExit(status => {
      status === 0 ? resolve(str) : reject(status)
    })
    process.start()
  })
}

// Launches the Flutter executable to determine its current version
export function getFlutterVersion() {
  return new Promise<string>((resolve, reject) => {
    const process = new Process("/usr/bin/env", {
      args: ["flutter", "--version"],
      stdio: ["ignore", "pipe", "ignore"]
    })
    let str = ""
    const output: string[] = []
    process.onStdout(line => {
      console.log(line)
      output.push(line)
      const arr = output.toString().match(re) ?? ["Unknown"]
      str = arr[0]
    })
    process.onDidExit(status => {
      status === 0 ? resolve(str) : reject(status)
    })
    process.start()
  })
}
