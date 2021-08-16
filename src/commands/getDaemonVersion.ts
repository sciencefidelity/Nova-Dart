import { wrapCommand } from "../utils/utils"
import { state } from "../globalVars"

export function registerGetDaemonVersion() {
  return nova.commands.register(
    "sciencefidelity.dart.commands.getDaemonVersion",
    wrapCommand(getDaemonVersion)
  )
}

async function getDaemonVersion() {
  return new Promise<void>(() => {
    console.log("Getting daemon version")
    state.daemon?.request("version()").then(reply => {
      console.log(reply)
    })
  })
}
