const re = /\b[0-9]*\.[0-9]*\.[0-9]*\b/;

// Launches the Dart executable to determine its current version
export async function getDartVersion() {
  return new Promise<string>((resolve, reject) => {
    const process = new Process("/usr/bin/env", {
      args: ["dart", "--version"],
      stdio: ["ignore", "ignore", "pipe"]
    });
    let str = "";
    process.onStderr(function (line) {
      const arr = line.match(re) || ["unknown"];
      str = arr[0];
      console.log(line);
    });
    process.onDidExit(status => {
      if (status === 0) {
        resolve(str);
      } else {
        reject(status);
      }
    });
    process.start();
  });
}

// Launches the Flutter executable to determine its current version
export async function getFlutterVersion() {
  return new Promise<string>((resolve, reject) => {
    const process = new Process("/usr/bin/env", {
      args: ["flutter", "--version"],
      stdio: ["ignore", "pipe", "ignore"]
    });
    let str = "";
    const output: string[] = [];
    process.onStdout(function (line) {
      console.log(line);
      output.push(line);
      const arr = output.toString().match(re) || ["Unknown"];
      str = arr[0];
    });
    process.onDidExit(status => {
      if (status === 0) {
        resolve(str);
      } else {
        reject(status);
      }
    });
    process.start();
  });
}
