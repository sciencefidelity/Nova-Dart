## Version 0.5.3

Temporarily remove functionality where the extension tries to find the Dart LSP, which will now need to be input manually in preferences.
Allow users to use choose a file of a folder with the picker when adding the path to the LSP.
Process to path so that the LSP file cannot be added twice (by the user and by the extension).

## Version 0.5.2

Fix type errors that were causing build to fail.
Temporarily remove @types/nova-editor-node while sending a PR to Definately Typed.

## Version 0.5.1

Fix a bug that would show an alert when reloading the LSP.

## Version 0.5.0

The Color Assistant is now fully functional.
Added named colors for all Material and Cupertino colors.
Hot reload not working.

## Version 0.4.1

Add editor menu command and shortcut for hot reload.
Add editor menu command and shortcut to open iOS Simulator and the Android Emulator.

## Version 0.4.0

Implemented document formatting on save.

## Version 0.3.1

Register sidebar with information view listing Dart and Flutter versions installed.

## Version 0.3.0

Extension now connects to the LSP and hover tips are shown in the editor.

## Version 0.2.2

Added syntax highlighting for html strings.
Highlighting inside dartdoc comments now works.
Improved highlighting for imports.
Started to add support for completions.

## Version 0.2.1

Syntax rewritten and is now readable and intuitive, and the syntax is usable.

## Version 0.2.0

Support added for clips. Syntax highlighting mostly works.

## Version 0.1.1

Add support for identifiers and expressions, the syntax highlighting is almost usable.

## Version 0.1.0

Initial release. Not currently usable, syntax highlighting based on Nova's official TypeScript syntax, with language definitions coming from the [Dartlight](https://github.com/elMuso/Dartlight) extension for Sublime Text and the [Dart Code](https://github.com/Dart-Code/Dart-Code).
