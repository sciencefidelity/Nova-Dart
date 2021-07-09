// import { InformationView } from "./informationView";

nova.commands.register("sciencefidelity.dart.reload", reload);

let client: LanguageClient | null = null;
const compositeDisposable = new CompositeDisposable();

async function makeFileExecutable(file: string) {
  return new Promise<void>((resolve, reject) => {
    const process = new Process("/usr/bin/env", {
      args: ["chmod", "u+x", file],
    });
    process.onDidExit((status) => {
      if (status === 0) {
        resolve();
      } else {
        reject(status);
      }
    });
    process.start();
  });
}

nova.config.onDidChange('sciencefidelity.enableAnalyzer',
  async function (current) {
    if (current) {
      activate();
    } else {
      deactivate()
    }
  }
);

async function reload() {
  deactivate();
  console.log("reloading...");
  await asyncActivate();
}

async function asyncActivate() {
  // const informationView = new InformationView();
  // compositeDisposable.add(informationView);

  // informationView.status = "Activating...";
  const runFile = nova.path.join(nova.extension.path, "run.sh");

  // Uploading to the extension library makes this file not executable, so fix that
  await makeFileExecutable(runFile);

  let serviceArgs;
  if (nova.inDevMode() && nova.workspace.path) {
    const logDir = nova.path.join(nova.workspace.path, "logs");
    await new Promise<void>((resolve, reject) => {
      const p = new Process("/usr/bin/env", {
        args: ["mkdir", "-p", logDir],
      });
      p.onDidExit((status) => (status === 0 ? resolve() : reject()));
      p.start();
    });
    console.log("logging to", logDir);
    // passing inLog breaks some requests for an unknown reason
    // const inLog = nova.path.join(logDir, "languageServer-in.log");
    const outLog = nova.path.join(logDir, "languageServer-out.log");
    serviceArgs = {
      path: "/usr/bin/env",
      // args: ["bash", "-c", `tee "${inLog}" | "${runFile}" | tee "${outLog}"`],
      args: ["bash", "-c", `"${runFile}" | tee "${outLog}"`],
    };
  } else {
    serviceArgs = {
      path: runFile,
    };
  }

  const syntaxes = ["dart"];
  client = new LanguageClient(
    "sciencefidelity.dart",
    "Dart Language Server",
    {
      type: "stdio",
      ...serviceArgs,
      env: {
        INSTALL_DIR: // nova.config.get("sciencefidelity.dart.config.analyzerPath") ||
        "/usr/local/flutter/bin/cache/dart-sdk/bin/snapshots",
      },
    },
    {
      syntaxes,
    }
  );

  compositeDisposable.add(
    client.onDidStop((err) => {
      // informationView.status = "Stopped";

      let message = "Dart Language Server stopped unexpectedly";
      if (err) {
        message += `:\n\n${err.toString()}`;
      } else {
        message += ".";
      }
      message +=
        "\n\nPlease report this, along with any output in the Extension Console.";
      nova.workspace.showActionPanel(
        message,
        {
          buttons: ["Restart", "Ignore"],
        },
        (index) => {
          if (index == 0) {
            nova.commands.invoke("sciencefidelity.dart.reload");
          }
        }
      );
    })
  );

  client.start();

  // informationView.status = "Running";

  // informationView.reload(); // this is needed, otherwise the view won't show up properly, possibly a Nova bug
}

export async function activate() {
  if (nova.config.get("sciencefidelity.dart.config.enableAnalyzer", "boolean")) {
    console.log("activating...");
    if (nova.inDevMode()) {
      const notification = new NotificationRequest("activated");
      notification.body = "Dart extension is loading";
      nova.notifications.add(notification);
    }
    return asyncActivate()
      .catch((err) => {
        console.error("Failed to activate");
        console.error(err);
        nova.workspace.showErrorMessage(err);
      })
      .then(() => {
        console.log("activated");
      });
  }
}

export function deactivate() {
  client?.stop();
  compositeDisposable.dispose();
}
