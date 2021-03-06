export async function cancelSubs(subscriptions: CompositeDisposable | null) {
  if (subscriptions) {
    subscriptions.dispose()
    subscriptions = null
  }
}

export async function cleanPid(pid: number) {
  return new Promise<void>((resolve, reject) => {
    const p = new Process("usr/bin/env", {
      args: ["kill", pid.toString()],
      stdio: ["ignore", "ignore", "ignore"]
    })
    p.onDidExit(status => (status === 0 ? resolve() : reject(status)))
  })
}

export async function makeFileExecutable(file: string) {
  return new Promise<void>((resolve, reject) => {
    const process = new Process("/usr/bin/env", {
      args: ["chmod", "u+x", file]
    })
    process.onDidExit(status => {
      status === 0 ? resolve() : reject(status)
    })
    process.start()
  })
}

export async function openFile(uri: string) {
  const newEditor = await nova.workspace.openFile(uri)
  if (newEditor) return newEditor
  console.warn("Failed to open, retrying once", uri)
  // try one more time, this doesn't resolve if the file isn't already open
  return await nova.workspace.openFile(uri)
}

export const showActionableError = (
  id: string,
  title: string,
  body: string,
  actions: string[],
  callback: any
) => {
  const request = new NotificationRequest(id)
  request.title = nova.localize(title)
  request.body = nova.localize(body)
  request.actions = actions.map(action => nova.localize(action))
  nova.notifications
    .add(request)
    .then(response => callback(response.actionIdx))
    .catch(err => console.error(err, err.stack))
}

// prettier-ignore
export async function stopProcess(process: Process | null, terminateOrKill: string) {
  if (process) {
    terminateOrKill === "terminate" ? process.terminate() : process.kill()
  }
  process = null
}

export function wrapCommand(
  // eslint-disable-next-line no-unused-vars
  command: (...args: any[]) => void | Promise<void>
  // eslint-disable-next-line no-unused-vars
): (...args: any[]) => void {
  return async function wrapped(...args: any[]) {
    try {
      await command(...args)
    } catch (err) {
      nova.workspace.showErrorMessage("Error")
    }
  }
}
