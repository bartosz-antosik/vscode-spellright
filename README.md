# Spell Right

Spell Checker for Visual Studio Code.

## Features

* Spells **plain text**/**markdown**/**LaTeX** documents, *strings*/*comments* parts of most **source code** documents and *text*/*comment* nodes on **XML**/**HTML** class documents ([see here for examples](SCREENSHOTS.md)).
* **Case sensitive** which means that it will distinguish between incorrect *english* and correct *English*, *french* and *French* etc.
* Spells **short words** and **abbreviations** (etc., I'm, i.e., ...)
* Spells **CamelCase** and **snake_case** compound phrases.
* Unobtrusive **GUI**/**command** interface for switching spelling dictionary (language) and turning spelling ON/OFF for particular document type.
* Small memory & CPU usage footprint - uses **offline**, **OS native** spell checking service whenever possible: Windows Spell Checking API (windows 8/10) or Hunspell (windows 7, macOS, Linux).
* Supports **every language dictionary** supported by either of the above mentioned spelling engines.
* Extension uses **background processing** (on idle) and **differential edit notifications** to minimize area spelled during editing only to lines touched by changes.

> This extension is currently limited to **64-bit Windows platform**. It is due to problems with distribution of native modules in current VSCode's distribution model. For details see (and up-vote maybe) discussion about VSCode's feature request [#20266](https://github.com/Microsoft/vscode/issues/20266).

## Screenshot

![screenshot](media/screenshot-default.png)

[More Screenshots](SCREENSHOTS.md)

## Installation

Search for *Spell Right* from the extension installer within VSCode or execute below line in the **command palette** (**F1**/**Ctrl+Shift+P**):
```
ext install spellright
```

### Windows 7 installation note

Windows 7 does not have Spell Checking API so in this case extension uses then built in *Hunspell* spell checker. To use it a pair of Dictionary/Affixes (\*.dic/\*.aff) files have to be downloaded from [here](https://github.com/titoBouzout/Dictionaries) (please remember to download RAW files) and placed in `Dictionaries` subfolder of VSCode's user global configuration directory (usually located at `c:\Users\%USERNAME%\AppData\Roaming\Code\`, `Dictionaries` subfolder does not exists there by default and has to be created manually). Dictionaries will be then listed in the language selection list and used for spelling documents. Because Hunspell is very slow in serving suggestions to misspelled words it may be useful to set `spellright.suggestionsInHints` to false. It will speed spelling up and suggestions will still be available in context menu called upon action for the suggestion.

## Usage

### Correcting Spelling Errors

Use **F8**/**Shift-F8** to jump to next/previous spelling error. Press **Ctrl+.** or click *Lightbulb* to see context menu with suggestions.

### Changing Language and Turning OFF

Extension has a handy list interface for switching spelling dictionary (language) or turning spelling OFF for currently open document type:

![dictionary](media/screenshot-dictionary.png)

It can be reached by clicking on indicator field in status bar:

![switch](media/screenshot-switch-on.png)

Alternatively same result can be achieved selecting command `SpellRight: Select Dictionary (Language)` or `SpellRight: Turn OFF for Current Document Type` from the **command palette** (**F1**/**Ctrl+Shift+P**).

## Commands

`SpellRight: Create/Update Workspace Settings`

Creates or updates workspace settings file `spellright.json`.

`SpellRight: Select Dictionary (Language)`

Pops dictionary selection GUI. The list also allows to turn spelling OFF for currently open document type. Can also be reached by clicking indicator field in status bar.

`SpellRight: Turn OFF for Current Document Type`

Turn spelling OFF for currently open document type.

## Settings

This extension contributes the following settings (with default values):

`spellright.language: en`

Default language (dictionary/country name) used for spelling. Typically in a LANGUAGE or LANGUAGE-COUNTRY format (e.g.: "en", "fr", "en-US", "en-GB", "fr-CA", "pl-PL" etc.)

`spellright.statusBarIndicator: true`

Enable/disable language & status indicator switch in status bar.

`spellright.suggestionsInHints: true`

Enable/disable including suggested corrections in hints. Disabling suggestions significantly speeds checking up. May be useful in case of large, often switched or saved documents.

`spellright.documentTypes: [ "plaintext", "markdown", "latex" ]`

Document types for which spelling will be turned ON by default.

`spellright.ignoreWords: []`

Words ignored by in spelling. Usually contains words which are considered misspelled by the main spelling engine but should be ignored/treated as spelled correctly by the extension.

`spellright.ignoreRegExps: []`

Regular expressions ignored in spelling. Allows to ignore generalized misspelled expressions.

## Known Issues

* VSCode is missing event that would tell extension about cursor jumps in the document. Recently entered word which has not been ended with a white space or punctuation character will be spelled not on cursor jump but on a subsequent edit somewhere else in the document (this is probably more of a VSCode's issue).
* Hint box associated with "Bulb" Code Action has an ugly habit of wrapping text at certain width not at white/punctuation character thus suggestions got cut in weird places (this is probably more of a VSCode's issue).
* Status bar indicator is not always in the same place - other extensions that add items to status bar "compete" for the place and it jumps from the last to one before last position in some cases (as all the above this is probably more of a VSCode's issue).

This extension can still be considered a Work In Progress. Please report all the errors and/or annoyances that you see on the [issues](https://github.com/bartosz-antosik/vscode-spellright/issues) page.

## Acknowledgments

Part of extension's code is loosely based on code found in *Spell Checker* extension ([vscode-spellchecker](https://github.com/swyphcosmo/vscode-spellchecker)) by Michael Vernier. This extension has in turn, if I understand things correctly, evolved from *Spelling and Grammar Checker* extension ([vscode-spell-check](https://github.com/Microsoft/vscode-spell-check)) by Sean McBreen.

## Release Notes

[Changelog](CHANGELOG.md)
