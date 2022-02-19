![](https://raw.githubusercontent.com/sciencefidelity/Nova-Dart/main/images/README/readme-header.png)

Advanced [Flutter](https://flutter.dev) and [Dart](https://dart.dev) tools for [Nova](https://nova.app).

Supports syntax highlighting, intelligent code completion, auto formatting, the Nova Color Assistant, commands, sidebar and clips.

<br />

![](https://raw.githubusercontent.com/sciencefidelity/Nova-Dart/main/images/README/screenshot.png)

### Installation

To use this extension you will need to have the [Flutter SDK](https://flutter.dev/docs/get-started/install/macos) or the [Dart SDK](https://dart.dev/get-dart) installed on your system.

To use the built in language server, specify the full path to the the Dart Language Server executable (`analysis_server.dart.snapshot`) in the extension preferences.

If using Flutter will be `<path to Flutter SDK>/flutter/bin/cache/dart-sdk/bin/snapshots`, or if using the Dart SDK the path will be `<path to Dart SDK>/dart-sdk/bin/snapshots`.

If you installed Flutter with Homebrew the path will be similar to one the following:

```shell
# for M1 mac
/opt/homebrew/Caskroom/flutter/2.8.0/flutter/bin/cache/dart-sdk/bin/snapshots
# for Intell mac
/usr/local/Caskroom/flutter/2.8.0/flutter/bin/cache/dart-sdk/bin/snapshots
```

Please [open an issue](https://github.com/sciencefidelity/Nova-Dart/issues) and let me know the install paths of other package managers.

### Caveats

The extension is still in beta, several planned features are not fully implemented, you may find UI elements and commands that do not work. If you find something that dosen't work or have a feature request please feel free to [open an issue](https://github.com/sciencefidelity/Nova-Dart/issues).

### Credits

The syntax of Dart was modified from [Dart Code](https://github.com/Dart-Code/Dart-Code) by Danny Tuppeny. Much of the code for the LSP was copied from [TypeScript](https://github.com/apexskier/nova-typescript) by Cameron Little. Clips are borrowed from [Dart Code](https://github.com/Dart-Code/Dart-Code) by Danny Tuppeny. Many thanks to the creators of those extensions!

Dart and the related logo are trademarks of Google LLC. Flutter and the related logo are trademarks of Google LLC. We are not endorsed by or affiliated with Google LLC.

<br />
