import { cleanPath } from "nova-extension-utils";
import { wrapCommand } from "../novaUtils";

export function registerFlutterRun() {
  return nova.commands.register(
    "sciencefidelity.dart.commands.flutterRun",
    wrapCommand(flutterRun)
  );

  async function flutterRun(): Promise<void>;
  async function flutterRun() {
    return new Promise((resolve, reject) => {

      console.log("Running")
      const flutterRunProcess = new Process("usr/bin/env", {
        args: ["echo", "hello"],
        stdio: ["ignore", "pipe", "ignore"],
        shell: true
      });
      const str = "";
      flutterRunProcess.onStdout(function (line) {
        console.log(line);
      });
      flutterRunProcess.onStderr(function (line) {
        console.log(line);
      });
      flutterRunProcess.onDidExit(status => {
        if (status === 0) {
          resolve(str);
        } else {
          reject(status);
        }
      });
      flutterRunProcess.start();
    });
  }
}
