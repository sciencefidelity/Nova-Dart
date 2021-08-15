import { state } from "../globalVars"
import { wrapCommand } from "../utils/utils"

export function registerGetDaemonVersion() {
  return nova.commands.register(
    "sciencefidelity.dart.commands.getDaemonVersion",
    wrapCommand(getDaemonVersion)
  )
}

async function getDaemonVersion() {
  console.log("Getting daemon version")
  state.jsonRpc?.notify("daemon.version")
}
