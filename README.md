# Dart extension for Nova

> This extension is in early development.

[Nova](https://nova.app) support for [Dart](https://dart.dev), [Flutter](https://flutter.dev) and [AngularDart](https://angualardart.dev).

Support for syntax highlighting, language server protocol, auto formatting, clips and the Nova Color Assistant.

### Useful links

- [Setting up Flutter tooling on macOS](https://flutter.dev/docs/get-started/install/macos)
- [List of Dart lint rules](https://dart-lang.github.io/linter/lints/)
- [Customising the linter](https://dart.dev/guides/language/analysis-options#the-analysis-options-file)

### TODO

- Have a running app [hot reloaded](https://flutter.dev/docs/development/tools/hot-reload) on save, add buttons and commands to start, stop hot reload and hot restart (`r` and `R` in the terminal).
- Add a command to create a Flutter app.
- Add command to open [Dart's devtools](https://dart.dev/tools/dart-devtools).
- Show scaffold of the open file in the sidebar ([Dart Code](https://github.com/Dart-Code/Dart-Code) does this).
- Allow user to enable/disable highlighting inside strings. ([Dart Vim Plugin](https://github.com/dart-lang/dart-vim-plugin) does this).

### Known bugs

- The LSP is not completely stable and can crash.
- Nova does not allow scrolling inside LSP hover windows and many of the Dart analysis docs are too long to fit on screen.
- Syntax highlighting does not work inside LSP hover windows.
- Key bindings do not work if two running extensions use the same key binding. I would like to use `option-shift-f` to format, as is used by Prettier and Dart Code, but it does not work if Prettier is also running. Auto format on save is not affected.
- Some colours are as yet undecided and could change in the final syntax: `var` and `void`, `this` and `super`, dartdoc highlighting.

### Contributing

Clone this repo, run `yarn` or `npm install` in the top level directory to install dependencies. Open in Nova `nova .` then run the custom task to build the extension scripts before activating the project as extension from the the Extensions menu.

Thank you!

### Credits

The syntax of Dart was modified from [Dart Code](https://github.com/Dart-Code/Dart-Code) by Danny Tuppeny. Much of the code for the LSP was copied from [TypeScript](https://github.com/apexskier/nova-typescript) by Cameron Little. Clips are borrowed from [Dart Code](https://github.com/Dart-Code/Dart-Code) by Danny Tuppeny. The script for loading the color assistant was adapted from Nova's built in css extension. Many thanks to the creators of those extensions!

Dart and the related logo are trademarks of Google LLC. Flutter and the related logo are trademarks of Google LLC. We are not endorsed by or affiliated with Google LLC.

<br />
