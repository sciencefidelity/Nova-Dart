import { cleanPath, preferences } from "nova-extension-utils";
import { DartColorAssistant } from "./colors";
import { InformationView } from "./informationView";
import { registerFormatDocument } from "./commands/formatDocument";
import { registerGetDependencies } from "./commands/getDependencies";
import { registerHotReload } from "./commands/hotReload";
import { registerOpenSimulator } from "./commands/openSimulartor";
import { registerOpenEmulator } from "./commands/openEmulator";
import { wrapCommand, makeFileExecutable } from "./novaUtils";

// Colors
const Colors = new DartColorAssistant();
nova.assistants.registerColorAssistant(["dart"], Colors);

const formatOnSaveKey = "sciencefidelity.dart.config.formatDocumentOnSave";

nova.commands.register(
  "sciencefidelity.dart.openWorkspaceConfig",
  wrapCommand(function openWorkspaceConfig(workspace: Workspace) {
    workspace.openConfig();
  })
);

nova.commands.register("sciencefidelity.dart.reload", reload);
nova.commands.register("sciencefidelity.dart.hotReload", registerHotReload);

let client: LanguageClient | null = null;
const compositeDisposable = new CompositeDisposable();
const informationView = new InformationView();

const re = /\b[0-9]*\.[0-9]*\.[0-9]*\b/

// Launches the Dart executable to determine its current version
async function getDartVersion() {
  return new Promise<string>((resolve, reject) => {
    const process = new Process("/usr/bin/env", {
      args: ["dart", "--version"],
      stdio: ["ignore", "ignore", "pipe"]
    });
    let str = "";
    process.onStderr(function (line) {
      const arr = line.match(re) || ["unknown"];
      str = arr[0];
      console.log(line);
    });
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

// Launches the Flutter executable to determine its current version
async function getFlutterVersion() {
  return new Promise<string>((resolve, reject) => {
    const versionFile = nova.path.join(nova.extension.path, "version.sh");
    makeFileExecutable(versionFile);
    const process = new Process("/usr/bin/env", {
      args: ["bash", "-c", `"${versionFile}"`],
      stdio: ["ignore", "pipe", "ignore"]
    });
    let str = "";
    process.onStdout(function (line) {
      const arr = line.match(re) || ["Unknown"];
      str = arr[0];
      console.log(line);
    });
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

nova.config.onDidChange(
  "sciencefidelity.dart.config.enableAnalyzer",
  async function (current) {
    if (current) {
      activate();
    } else {
      deactivate();
    }
  }
);

async function reload() {
  if (
    nova.config.get("sciencefidelity.dart.config.enableAnalyzer", "boolean")
  ) {
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
        args: ["mkdir", "-p", logDir]
      });
      p.onDidExit(status => (status === 0 ? resolve() : reject()));
      p.start();
    });
    console.log("logging to", logDir);
    // passing inLog breaks some requests for an unknown reason
    // const inLog = nova.path.join(logDir, "languageServer-in.log");
    const outLog = nova.path.join(logDir, "languageServer-out.log");
    serviceArgs = {
      path: "/usr/bin/env",
      // args: ["bash", "-c", `tee "${inLog}" | "${runFile}" | tee "${outLog}"`],
      args: ["bash", "-c", `"${runFile}" | tee "${outLog}"`]
    };
  } else {
    serviceArgs = {
      path: runFile
    };
  }

  let path;
  if (nova.inDevMode() && nova.workspace.path) {
    path = `${cleanPath(nova.workspace.path)}/test-workspace`;
  } else if (nova.workspace.path) {
    path = cleanPath(nova.workspace.path);
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
        INSTALL_DIR:
          nova.config.get(
            "sciencefidelity.dart.config.analyzerPath",
            "string"
          ) || "~/flutter/bin/cache/dart-sdk/bin/snapshots"
      }
    },
    {
      initializationOptions: {
        onlyAnalyzeProjectsWithOpenFiles: true
      },
      syntaxes
    }
  );

  // register nova commands
  compositeDisposable.add(registerFormatDocument(client));
  compositeDisposable.add(registerGetDependencies());
  compositeDisposable.add(registerHotReload(client));
  compositeDisposable.add(registerOpenSimulator());
  compositeDisposable.add(registerOpenEmulator());

  compositeDisposable.add(
    client.onDidStop(err => {
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
          buttons: ["Restart", "Ignore"]
        },
        index => {
          if (index == 0) {
            nova.commands.invoke("sciencefidelity.dart.reload");
          }
        }
      );
    })
  );

  client.start();

  compositeDisposable.add(
    nova.workspace.onDidAddTextEditor(editor => {
      const editorDisposable = new CompositeDisposable();
      compositeDisposable.add(editorDisposable);
      compositeDisposable.add(
        editor.onDidDestroy(() => editorDisposable.dispose())
      );

      // watch things that might change if this needs to happen or not
      editorDisposable.add(editor.document.onDidChangeSyntax(refreshListener));
      editorDisposable.add(
        nova.config.onDidChange(formatOnSaveKey, refreshListener)
      );
      editorDisposable.add(
        nova.workspace.config.onDidChange(formatOnSaveKey, refreshListener)
      );

      let willSaveListener = setupListener();
      compositeDisposable.add({
        dispose() {
          willSaveListener?.dispose();
        }
      });

      function refreshListener() {
        willSaveListener?.dispose();
        willSaveListener = setupListener();
      }

      function setupListener() {
        if (
          !(syntaxes as Array<string | null>).includes(editor.document.syntax)
        ) {
          return;
        }
        const formatDocumentOnSave =
          preferences.getOverridableBoolean(formatOnSaveKey);
        if (!formatDocumentOnSave) {
          return;
        }
        return editor.onWillSave(async editor => {
          if (formatDocumentOnSave) {
            await nova.commands.invoke(
              "sciencefidelity.dart.commands.formatDocument",
              editor
            );
          }
        });
      }
    })
  );

  informationView.status = "Running";

  informationView.reload(); // this is needed, otherwise the view won't show up properly, possibly a Nova bug
}

export async function activate() {
  console.log("activating...");

  compositeDisposable.add(informationView);

  getDartVersion().then(dartVersion => {
    informationView.dartVersion = dartVersion;
  });

  getFlutterVersion().then(flutterVersion => {
    informationView.flutterVersion = flutterVersion;
  });

  if (
    nova.config.get("sciencefidelity.dart.config.enableAnalyzer", "boolean")
  ) {
    if (nova.inDevMode()) {
      const notification = new NotificationRequest("activated");
      notification.body = "Dart LSP is loading";
      nova.notifications.add(notification);
    }
    return asyncActivate()
      .catch(err => {
        console.error("Failed to activate");
        console.error(err);
        nova.workspace.showErrorMessage(err);
      })
      .then(() => {
        console.log("activated");
      });
  }

  informationView.reload(); // this is needed, otherwise the view won't show up properly, possibly a Nova bug
}

export function deactivate() {
  client?.stop();
  compositeDisposable.dispose();
}
