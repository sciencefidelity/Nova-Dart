import { wrapCommand } from "../utils/utils"
import { state } from "../globalVars"

export const registerGetDaemonVersion = () => {
  return nova.commands.register(
    "sciencefidelity.dart.commands.getDaemonVersion",
    wrapCommand(getDaemonVersion)
  )
}

const getDaemonVersion = async () => {
  console.log("Getting daemon version")
  state.daemon?.request("daemon.version").then((reply) => {
    console.log("message sent")
    console.log(reply.result)
  })
}
