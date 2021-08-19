let appName = "my_app"
let installLocation = nova.workspace.path!

export async function flutterCreate() {
  console.log("Creating new Flutter app")
  try {
    appName = await chooseAppName()
  } catch {
    console.log("App name not given")
  }
  try {
    installLocation = await chooseInstallLocation()
  } catch {
    console.log("Path not given")
  }
  const create = new Process("/usr/bin/env", {
    args: ["flutter", "create", appName],
    cwd: installLocation!,
    stdio: ["ignore", "pipe", "pipe"]
  })
  create.onStdout(line => {
    console.log(line)
  })
  create.onStderr(line => {
    console.log(line)
  })
  create.start()
}

async function chooseAppName() {
  // eslint-disable-next-line no-unused-vars
  return new Promise<string>((resolve, _reject) => {
    const options = {
      placeholder: "my_app"
    }
    nova.workspace.showInputPanel(
      "Choose a name for your Flutter app.",
      options,
      title => {
        console.log(title)
        if (title) resolve((appName = title.trim()))
      }
    )
  })
}

function chooseInstallLocation() {
  // eslint-disable-next-line no-unused-vars
  return new Promise<string>((resolve, _reject) => {
    const options = {
      allowFiles: false,
      allowFolders: true,
      allowMultiple: false
    }
    nova.workspace.showFileChooser(
      "Choose install location for your app",
      options,
      path => {
        console.log(path)
        if (path) resolve((installLocation = path[0]))
      }
    )
  })
}
