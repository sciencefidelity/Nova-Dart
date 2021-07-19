# Dart extension for Nova

> This extension is in early development.

[Nova](https://nova.app) support for [Dart](https://dart.dev), [Flutter](https://flutter.dev) and [AngularDart](https://angualardart.dev).

This extension supports syntax highlighting, language server protocol and clips.

### TODO

- Some colours are as yet undecided and could change in the final syntax: `var` and `void`; `this` and `super`.
- Highlighting inside dartdoc is not working for some reason.
- Dart SDK has a [built in formatter](https://dart.dev/tools/dart-format) initiated with `dart format .`.
- Dart has a [Linter](https://dart-lang.github.io/linter/lints/) - add support that can be turned enabled is extension preferences.
- When started from the command line a Flutter app can be [hot reloaded](https://flutter.dev/docs/development/tools/hot-reload) by pressing r in the terminal - investigate automating this.
- Enable HTML syntax highlighting inside Dart strings, allow user to enable/disable. ([Dart Vim Plugin](https://github.com/dart-lang/dart-vim-plugin) does this)
- Information on [Dart's devtools](https://dart.dev/tools/dart-devtools).

### Contributing

Clone this repo, run `yarn` or `npm install` in the top level directory to install dependencies. Open in Nova `nova .` then run the custom task to build the extension scripts before activating the project as extension from the the Extensions menu.

Thank you!

### Credits

To learn syntax highlighting in Nova I used the built in TypeScript and JavaScript syntaxes as templates. The syntax of Dart was learnt from [Dart Code](https://github.com/Dart-Code/Dart-Code) via the [Dartlight](https://github.com/elMuso/Dartlight) extension for Sublime Text/Textastic, which helped me understand how to port it to Nova. Many thanks to the creators of those extensions!

Clips are borrowed from [Dart Code](https://github.com/Dart-Code/Dart-Code) by Danny Tuppeny.
