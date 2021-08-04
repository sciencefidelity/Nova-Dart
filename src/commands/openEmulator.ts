import { wrapCommand } from "../novaUtils";

export function registerOpenEmulator() {
  return nova.commands.register(
    "sciencefidelity.dart.commands.openEmulator",
    wrapCommand(openEmulator)
  );

  // Opens the iOS Simulator
  // eslint-disable-next-line no-unused-vars
  async function openEmulator(): Promise<void>;
  // TODO: Open an alert to let the user choose an avd
  async function openEmulator() {
    return new Promise((resolve, reject) => {
      const process = new Process("/usr/bin/env", {
        args: ["emulator", "-avd", "Pixel_3a_API_30_x86"],
        stdio: ["ignore", "ignore", "pipe"]
      });
      const str = "";
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
}
