# Dart Tools for Nova

![](https://github.com/sciencefidelity/Nova-Dart/blob/dac53d2d255276b77d8bce1af8125aba4cc1a38a/Dart.novaextension/Images/README/readme-header.png)

[Nova](https://nova.app) support for [Dart](https://dart.dev), [Flutter](https://flutter.dev) and [AngularDart](https://angualardart.dev).

This extension supports syntax highlighting, language server protocol and clips.



![](https://github.com/sciencefidelity/Nova-Dart/blob/6c30cffc980d8d3c5a8289d269662bd7d85d51fe/Dart.novaextension/Images/README/screenshot.png)

### Installation

To use this extension you will need to have the [Flutter SDK](https://flutter.dev/docs/get-started/install/macos) or the [Dart SDK](https://dart.dev/get-dart) installed on your system.

You will need to specify the location of the Dart Language Server in the plugin preferences. If you have installed the Flutter SDK in your home directory then the extension should connect automatically, otherwise specify the full path to the language server executable (`analysis_server.dart.snapshot`) which if using Flutter will be `<path to Flutter SDK>/flutter/bin/cache/dart-sdk/bin/snapshots`, if using the Dart SDK the path will be `<path to Dart SDK>/dart-sdk/bin/snapshots`.

### Credits

The syntax of Dart was modified from [Dart Code](https://github.com/Dart-Code/Dart-Code) by Danny Tuppeny. Much of the code for the LSP was copied from [TypeScript](https://github.com/apexskier/nova-typescript) by Cameron Little. Clips are borrowed from [Dart Code](https://github.com/Dart-Code/Dart-Code) by Danny Tuppeny. Many thanks to the creators of those extensions!
