import { wrapCommand } from "../novaUtils"
import { daemon } from "../startFlutterDaemon"

export const registerGetDaemonVersion = () => {
  return nova.commands.register(
    "sciencefidelity.dart.commands.getDaemonVersion",
    wrapCommand(getDaemonVersion)
  )
}

const getDaemonVersion = async () => {
  console.log("Getting daemon version")
  daemon?.request("daemon.version").then((reply) => {
    console.log("message sent")
    console.log(reply.result)
  })
}
