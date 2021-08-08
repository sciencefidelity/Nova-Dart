import { wrapCommand } from "../novaUtils";

export function registerFlutterRun() {
  return nova.commands.register(
    "sciencefidelity.dart.commands.flutterRun",
    wrapCommand(flutterRun)
  );

  async function flutterRun(): Promise<void> {
    return new Promise(() => {
      console.log("running task");
      const process = new Process("usr/bin/env", {
        args: ["echo", "hello"],
        stdio: "pipe",
        shell: true
      });
      process.onStdout(function (line) {
        console.log(line);
      });
      process.start();
    });
  }
}
