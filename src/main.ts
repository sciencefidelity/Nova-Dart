import { cleanPath } from "nova-extension-utils";
import { InformationView } from "./informationView";
import { wrapCommand } from "./novaUtils";
import { DartColorAssistant } from "./colors"

// Colors
const Colors = new DartColorAssistant();
nova.assistants.registerColorAssistant(["dart"], Colors);

nova.commands.register(
  "sciencefidelity.dart.openWorkspaceConfig",
  wrapCommand(function openWorkspaceConfig(workspace: Workspace) {
    workspace.openConfig();
  })
);

nova.commands.register("sciencefidelity.dart.reload", reload);

let client: LanguageClient | null = null;
const compositeDisposable = new CompositeDisposable();
const informationView = new InformationView();
compositeDisposable.add(informationView);

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

// Launches the Dart executable to determine its current version
async function getDartVersion() {
  return new Promise<string>(() => {
    const process = new Process("/usr/bin/env", {
      args: ["dart --version"]
    });
    process.onStdout(function(line) {
      console.log("Running " + line);
    });
    process.start();
  });
}

nova.config.onDidChange("sciencefidelity.dart.config.enableAnalyzer",
  async function (current) {
    if (current) {
      activate();
    } else {
      deactivate()
    }
  }
);

async function reload() {
  if (nova.config.get("sciencefidelity.dart.config.enableAnalyzer", "boolean")) {
    deactivate();
    console.log("reloading...");
    await asyncActivate();
  }
}

async function asyncActivate() {

  informationView.status = "Activating...";

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

  let path;
  if (nova.inDevMode() && nova.workspace.path) {
    path = `${cleanPath(nova.workspace.path)}/test-workspace`
  } else if (nova.workspace.path) {
    path = cleanPath(nova.workspace.path)
  }
  const syntaxes = ["dart"];
  client = new LanguageClient(
    "sciencefidelity.dart",
    "Dart Language Server",
    {
      type: "stdio",
      ...serviceArgs,
      env: {
        WORKSPACE_DIR: path || "",
        INSTALL_DIR: nova.config.get("sciencefidelity.dart.config.analyzerPath", "string") ||
        "~/flutter/bin/cache/dart-sdk/bin/snapshots",
      },
    },
    {
      initializationOptions: {
        "onlyAnalyzeProjectsWithOpenFiles": true
      },
      syntaxes
    }
  );

  compositeDisposable.add(
    client.onDidStop((err) => {

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

  informationView.status = "Running";

  informationView.reload(); // this is needed, otherwise the view won't show up properly, possibly a Nova bug

}

getDartVersion().then((version) => {
  console.log(version);
  informationView.dartVersion = version;
});

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
  };
}

export function deactivate() {
  client?.stop();
  compositeDisposable.dispose();
}
