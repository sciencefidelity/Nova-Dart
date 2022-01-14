![](https://photos.app.goo.gl/RpgcT3WibdWygqv98)

Advanced [Dart](https://dart.dev), [Flutter](https://flutter.dev) and [AngularDart](https://angualardart.dev) tools for [Nova](https://nova.app).

Supports syntax highlighting, intelligent code completion, auto formatting, the Nova Color Assistant, commands, sidebar and clips.

<br />

![](https://photos.app.goo.gl/qjwVqLTrZEhjMuTo6)

### Installation

To use this extension you will need to have the [Flutter SDK](https://flutter.dev/docs/get-started/install/macos) or the [Dart SDK](https://dart.dev/get-dart) installed on your system.

To use the built in language server, specify the location of the Dart Language Server in the extension preferences. If you have installed the Flutter SDK in your home directory then the extension should connect automatically, otherwise specify the full path to the language server executable (`analysis_server.dart.snapshot`), which if using Flutter will be `<path to Flutter SDK>/flutter/bin/cache/dart-sdk/bin/snapshots`, or if using the Dart SDK the path will be `<path to Dart SDK>/dart-sdk/bin/snapshots`.

### Caveats

The extension cannot currently find the dart LSP executable when installed by Homebrew. If you installed Flutter with Homebrew then use one of the following paths in the preferences:

```shell
# for M1 mac
/opt/homebrew/Caskroom/flutter/2.8.0/flutter/bin/cache/dart-sdk/bin/snapshots
# for Intell mac
/usr/local/Caskroom/flutter/2.8.0/flutter/bin/cache/dart-sdk/bin/snapshots
```

The extension is not finished and some planned features are not implemented, there are some UI elements and commands that available that will not work. This includes Hot Reloading - which is essential to this extension leaving beta. Please see these embelishment to the UI as a roadmap to the future of this extension. If you find something that dosen't work please feel free to [open an issue](https://github.com/sciencefidelity/Nova-Dart/issues).

### Credits

The syntax of Dart was modified from [Dart Code](https://github.com/Dart-Code/Dart-Code) by Danny Tuppeny. Much of the code for the LSP was copied from [TypeScript](https://github.com/apexskier/nova-typescript) by Cameron Little. Clips are borrowed from [Dart Code](https://github.com/Dart-Code/Dart-Code) by Danny Tuppeny. Many thanks to the creators of those extensions!

Dart and the related logo are trademarks of Google LLC. Flutter and the related logo are trademarks of Google LLC. We are not endorsed by or affiliated with Google LLC.

<br />
