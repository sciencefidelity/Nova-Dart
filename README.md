# Dart extension for Nova

> This extension is in early development.

[Nova](https://nova.app) support for [Dart](https://dart.dev), [Flutter](https://flutter.dev) and [AngularDart](https://angualardart.dev).

This extension supports syntax highlighting, language server protocol, auto formatting and clips.

### TODO

- Add commands for CLI tools.
- Dart SDK has a [built in formatter](https://dart.dev/tools/dart-format) initiated with `dart format .`.
- Dart has a [Linter](https://dart-lang.github.io/linter/lints/) - add support that can be turned enabled is extension preferences.
- When started from the command line a Flutter app can be [hot reloaded](https://flutter.dev/docs/development/tools/hot-reload) by pressing `r` in the terminal - investigate automating this.
- Enable HTML syntax highlighting inside Dart strings, allow user to enable/disable. ([Dart Vim Plugin](https://github.com/dart-lang/dart-vim-plugin) does this)
- Information on [Dart's devtools](https://dart.dev/tools/dart-devtools).
- Use Nova's color picker to choose colors.

### Known bugs

- Highlighting inside dartdoc is not working for some reason.
- Some colours are as yet undecided and could change in the final syntax: `var` and `void`; `this` and `super`.

### Contributing

Clone this repo, run `yarn` or `npm install` in the top level directory to install dependencies. Open in Nova `nova .` then run the custom task to build the extension scripts before activating the project as extension from the the Extensions menu.

Thank you!

### Credits

The syntax of Dart was modified from [Dart Code](https://github.com/Dart-Code/Dart-Code) by Danny Tuppeny. Much of the code for the LSP was copied from [TypeScript](https://github.com/apexskier/nova-typescript) by Cameron Little. Clips are borrowed from [Dart Code](https://github.com/Dart-Code/Dart-Code) by Danny Tuppeny. Many thanks to the creators of those extensions!

Dart and the related logo are trademarks of Google LLC. Flutter and the related logo are trademarks of Google LLC. We are not endorsed by or affiliated with Google LLC.

<br />
