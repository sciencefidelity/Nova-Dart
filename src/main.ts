import { cleanPath, preferences } from "nova-extension-utils";
import { daemon, startFlutterDeamon } from "./startFlutterDaemon";
import { DartColorAssistant } from "./colors";
import { InformationView } from "./informationView";
import { registerFlutterRun, registerFlutterStop } from "./commands/flutterRun";
import { registerFormatDocument } from "./commands/formatDocument";
import { registerOpenSimulator } from "./commands/openSimulartor";
import { registerOpenEmulator } from "./commands/openEmulator";
import { registerGetDaemonVersion } from "./commands/getDaemonVersion";
import { wrapCommand, makeFileExecutable } from "./novaUtils";
import { getDartVersion, getFlutterVersion } from "./getVersions";

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

let client: LanguageClient | null = null;
const compositeDisposable = new CompositeDisposable();
const informationView = new InformationView();

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
  const clientOptions = {
    initializationOptions: {
      // 	onlyAnalyzeProjectsWithOpenFiles: true,
      onlyAnalyzeProjectsWithOpenFiles: true,
      suggestFromUnimportedLibraries: true,
      closingLabels: true,
      outline: true,
      flutterOutline: true
    },
    syntaxes
  };

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
    clientOptions
  );

  // Register format on save command
  compositeDisposable.add(registerFormatDocument(client));

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
  // client.onNotification(
  //   "dart/textDocument/publishFlutterOutline",
  //   notification => {
  //     console.log(JSON.stringify(notification));
  //   }
  // );

  compositeDisposable.add(
    nova.workspace.onDidAddTextEditor(editor => {
      const editorDisposable = new CompositeDisposable();
      compositeDisposable.add(editorDisposable);
      compositeDisposable.add(
        editor.onDidDestroy(() => {
          editorDisposable.dispose();
          daemon?.kill();
        })
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
        // willSaveListener?.dispose();
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
  informationView.reload(); // this is needed
}

export async function activate() {
  console.log("activating...");

  // register nova commands
  compositeDisposable.add(registerFlutterRun());
  compositeDisposable.add(registerFlutterStop());
  compositeDisposable.add(registerOpenSimulator());
  compositeDisposable.add(registerOpenEmulator());
  compositeDisposable.add(registerGetDaemonVersion());
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
    asyncActivate()
      .catch(err => {
        console.error("Failed to activate");
        console.error(err);
        nova.workspace.showErrorMessage(err);
      })
      .then(() => {
        console.log("activated");
      });
  }

  informationView.reload(); // this is needed
  startFlutterDeamon();
}

async function deactivate() {
  client?.stop();
  compositeDisposable.dispose();
}
