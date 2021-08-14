const re = /\b[0-9]*\.[0-9]*\.[0-9]*\b/

// Launches the Dart executable to determine its current version
export async function getDartVersion() {
  return Promise.resolve().then(() => {
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
      return status === 0 ? str : new Error(str)
    })
    process.start()
  }) as Promise<string>
}

// Launches the Flutter executable to determine its current version
export async function getFlutterVersion() {
  return Promise.resolve().then(() => {
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
      return status === 0 ? str : new Error(str)
    })
    process.start()
  }) as Promise<string>
}
