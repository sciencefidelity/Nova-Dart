# Dart Tools for Nova

![](https://github.com/sciencefidelity/Nova-Dart/blob/adc72aa8f38110bcc259f6b05c3d34349e0811b4/Dart.novaextension/Images/README/readme-header.png)
<img src="https://github.com/sciencefidelity/Nova-Dart/blob/adc72aa8f38110bcc259f6b05c3d34349e0811b4/Dart.novaextension/Images/README/readme-header.png">

[Nova](https://nova.app) support for [Dart](https://dart.dev), [Flutter](https://flutter.dev) and [AngularDart](https://angualardart.dev).

This extension supports syntax highlighting, language server protocol and clips.

### Installation

To use this extension you will need to have the [Flutter SDK](https://flutter.dev/docs/get-started/install/macos) or the [Dart SDK](https://dart.dev/get-dart) installed on your system.

You will need to specify the location of the Dart Language Server in the plugin preferences. If you have installed the Flutter SDK in your home directory then the extension should connect automatically, otherwise specify the full path to the language server executable (`analysis_server.dart.snapshot`) which if using Flutter will be `<path to Flutter SDK>/flutter/bin/cache/dart-sdk/bin/snapshots`, if using the Dart SDK the path will be `<path to Dart SDK>/dart-sdk/bin/snapshots`.

### Credits

The syntax of Dart was modified from [Dart Code](https://github.com/Dart-Code/Dart-Code) by Danny Tuppeny. Much of the code for the LSP was copied from [TypeScript](https://github.com/apexskier/nova-typescript) by Cameron Little. Thanks go to the creators of those extensions!

Clips are borrowed from [Dart Code](https://github.com/Dart-Code/Dart-Code) by Danny Tuppeny.
