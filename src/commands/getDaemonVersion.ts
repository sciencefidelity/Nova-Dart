import { wrapCommand } from "../novaUtils";
import { daemon } from "../startFlutterDaemon";

export function registerGetDaemonVersion() {
  return nova.commands.register(
    "sciencefidelity.dart.commands.getDaemonVersion",
    wrapCommand(getDaemonVersion)
  );

  async function getDaemonVersion(): Promise<void>;
  async function getDaemonVersion() {
    console.log("Getting daemon version");
    daemon
      ?.request("daemon.version")
      .then(function (reply) {
        console.log("message sent");
        console.log(reply.result);
      });
  }
}
