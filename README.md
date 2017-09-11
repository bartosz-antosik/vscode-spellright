# Multilingual, offline Spell Checker for Visual Studio Code

[![Marketplace Version](https://vsmarketplacebadge.apphb.com/version/ban.spellright.svg)](https://marketplace.visualstudio.com/items?itemName=ban.spellright) [![Installs](https://vsmarketplacebadge.apphb.com/installs/ban.spellright.svg)](https://marketplace.visualstudio.com/items?itemName=ban.spellright) [![Rating](https://vsmarketplacebadge.apphb.com/rating/ban.spellright.svg)](https://marketplace.visualstudio.com/items?itemName=ban.spellright) [![license](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://github.com/bartosz-antosik/vscode-spellright/blob/master/LICENSE.md)

## Features

* Spells **plain text**/**markdown**/**LaTeX** documents, *strings*/*comments* parts of most **source code** (C++, Python, JavaScript, Batch etc.) documents and *text*/*comment* nodes on **XML**/**HTML** class documents.
* Supports **every language** that can be used with either of the below mentioned native spelling engines (e.g. **all languages** that are available in Microsoft Office, **multiple languages** in Windows Single Language editions etc.)
* Spelling **multiple languages in one document** using In-Document commands to switch between languages.
* **Case sensitive** which means that it will distinguish between *english* and *English*, *french* and *French* etc.
* Spells **short words** and **abbreviations** (etc., I'm, i.e., ...)
* Spells **CamelCase**, **snake_case** and **digit2inside** compound phrases respecting Unicode capital/small letters distinction (e.g.: *SuperŚlimak* is spelled as *Super* *Ślimak*) and capital letter adhesion (e.g.: *HTMLTest* is spelled as *HTML* *Test*).
* Unobtrusive **GUI**/**command** interface for switching spelling dictionary (language) and turning spelling ON/OFF for particular document class.
* **In-Document commands** allow to switch spelling **ON** or **OFF** despite global settings and **change spelling language** multiple times within the document.
* Small memory & CPU usage footprint - uses **offline**, **OS native** spell checking backends: Windows Spell Checking API (windows 8/10), NSSpellChecker (macOS) and Hunspell (Linux, Windows 7).
* Extension uses **background processing** (on idle) and **differential edit notifications** to minimize area spelled during editing only to lines touched by changes.

## Dictionaries

### **Windows 8+**

On Microsoft Windows from version 8 on Spell Right uses system spelling API. Follow system guidelines on how to install additional system spelling dictionaries.

### **macOS**

On macOS Spell Right uses system spelling API. Follow system guidelines on how to install additional system spelling dictionaries.

### **Linux and Windows 7**

On Linux and Windows 7 Spell Right uses built in *Hunspell* spell checker library. To use it a pair of Dictionary (\*.dic) and Affixes (\*.aff) files with **UTF-8 encoding** have to be downloaded e.g. from [here](https://github.com/titoBouzout/Dictionaries) (please remember to download RAW files) and placed in `Dictionaries` subfolder of VSCode's user global configuration directory, located at:

* **Windows:** `%APPDATA%\Code\Dictionaries\`
* **Linux:** `$HOME/.config/Code/Dictionaries/`

`Dictionaries` subfolder does not exists there by default and has to be created manually.

On most Linux distributions system-wide dictionaries can be reused (for now only UTF-8 encoded dictionaries are supported, verify `SET` line in \*.aff file) by soft linking the system folder e.g.:

```bash
ln -s /usr/share/hunspell ~/.config/Code/Dictionaries
```

Dictionaries from the folder will be listed in the language selection list and used for spelling documents. Because *Hunspell* engine is slower in serving suggestions to misspelled words it may be useful to set `spellright.suggestionsInHints` to `false` which will speed spelling up and suggestions will still be available in context menu called upon action for the suggestion.

### **User Dictionaries**

Spell Right stores words considered as spelled correctly and not existing in the spelling engine (a.k.a. ignored words) in two dictionaries. These are user and workspace dictionaries, both contained in `spellright.dict` files, one located in user settings folder and another in workspace settings folder (`.vscode`). User dictionary is always used and workspace dictionary is used in the context of opened folder. Both dictionaries are used in conjunction.

## Screenshots

### Plain Documents

Spelling of **plain text**/**markdown**/**LaTeX** documents:

![screenshot](media/screenshot-default.png)

### Source Code & Markup Documents

It can spell *strings*/*comments* parts of most **source code** (*C++*, *Python*, *JavaScript*, *Batch* and lots of others) and *text*/*comment* nodes on **XML**/**HTML** class documents:

![screenshot](media/screenshot-cpp.png)

![screenshot](media/screenshot-python.png)

![screenshot](media/screenshot-batch.png)

![screenshot](media/screenshot-html.png)

## Installation

Search for *Spell Right* from the extension installer within VSCode or execute below line in the **command palette** (**F1** or **Ctrl+Shift+P**):

```PowerShell
ext install spellright
```

## Usage

### Correcting Spelling Errors

Press **Ctrl+.** (Windows, Linux) **⌘+.** or **Cmd+.** (macOS) or click *Lightbulb* to show a context **menu with suggestions**. Use **F8** or **Shift-F8** to jump to **next**/**previous** spelling error.

### Changing Language and Turning OFF

Extension has a handy list interface for switching spelling dictionary (language) or turning spelling OFF for currently open document type:

![dictionary](media/screenshot-dictionary.png)

It can be reached by clicking on indicator field in status bar:

![switch](media/screenshot-switch-on.png)

Alternatively same result can be achieved selecting command `SpellRight: Select Dictionary (Language)` or `SpellRight: Turn OFF for Current Document Type` from the **command palette** (**F1**/**Ctrl+Shift+P**).

Status bar indicator also shows when spelling for particular document class has been turned OFF:

![switch](media/screenshot-switch-off.png)

Or when it has been forced OFF by In-Document command (`spellcheck-off`) or rule in `.spellignore`:

![switch](media/screenshot-switch-forced-off.png)

### Multiple languages in one document

When there is multiple languages selected by In-Document command <code>spellcheck&#x2d;language</code> placed within document:

![switch](media/screenshot-switch-multiple.png)

And when at least one language spelled is missing dictionary:

![switch](media/screenshot-switch-multiple-missing.png)

## Commands

This extension contributes the following commands:

`SpellRight: Create/Update Workspace Settings`

Creates or updates workspace settings file `spellright.json`.

`SpellRight: Select Dictionary (Language)`

Pops dictionary selection list. Selecting language also turns spelling ON. The list also allows to turn spelling OFF for currently open document type. Can also be reached by clicking indicator field in status bar.

`SpellRight: Turn OFF for Current Document Type`

Turn spelling OFF for currently open document type.

`SpellRight: Open User Dictionary File`

Open in editor `spellright.dict` file from user settings folder.

`SpellRight: Open Workspace Dictionary File`

Open in editor `spellright.dict` file from workspace settings folder.

`SpellRight: Add Selection to Workspace Dictionary`

Add text selected in editor to workspace dictionary.

`SpellRight: Add Selection to User Dictionary`

Add text selected in editor to user dictionary.

## Settings

This extension contributes the following settings (with default values):

`spellright.language: ""`

Default language (dictionary/country name) used for spelling. Typically in a LANGUAGE (e.g.: "en", "fr", when `groupDictionaries` is `true`) or LANGUAGE-COUNTRY format (e.g.: "en-US", "en-GB", "fr-CA", "pl-PL", when  `groupDictionaries` is `false`). When *Hunspell* spelling engine is used (e.g. in Windows 7) this setting should be the name of the dictionary file without extension. In case `language` parameter is not set then language from OS locales is used.

`spellright.statusBarIndicator: true`

Enable/disable language & status indicator switch in status bar.

`spellright.suggestionsInHints: true`

Enable/disable including suggested corrections in hints. Disabling suggestions significantly speeds checking up. May be useful in case of large, often switched or saved documents.

`spellright.addToSystemDictionary: false`

When `true` words added to user dictionary are stored in system default custom spelling dictionary instead.

`spellright.groupDictionaries: true`

Enable/disable grouping of dictionaries by language. Disabling grouping results in displaying dictionaries for all regional variants (e.g. en-US, en-GB, en-CA etc.) as separate entries. When enabled regional dictionaries are displayed as single dictionary under common language name (e.g. "English"). Works only on native Windows & macOS spelling APIs.

`spellright.documentTypes: [ "plaintext", "markdown", "latex" ]`

Document types for which spelling will be turned ON by default.

`spellright.ignoreRegExps: []`

Regular expressions ignored in spelling. Allows to ignore/consider as spelled correctly generalized expressions. Works on raw document **before** separating words to spell which allows to ignore larger parts of the document. Regular expressions have to be in double quoted format. That is backslash has to be quoted as well e.g.: `"/(\\\\.?)(gif|png)/g"` to ignore file extensions like `".gif"` and `".png"`.

`spellright.ignoreFiles: [ "**/.gitignore", "**/.spellignore" ]`

Set of file patterns to globally, silently exclude files from being spelled. Files described with this setting will not be reported as forced OFF spelling (red indicator in status bar). Patterns defined as for [gitignore](https://git-scm.com/docs/gitignore).

`spellright.notificationClass: "error"`

Allows to change class of diagnostic messages produced by Spell Right which changes in turn underline color. Possible values (with corresponding underline color) are: `"error"` (red), `"warning"` (green), `"information"` (green), `"hint"` (invisible).

`spellright.spellContext: "body comments strings"`

Allows to enable (present in string) or disable (absent in string) spelling of syntactic parts of the documents. Currently supported are:

* `body` - body of document (e.g. LaTeX, Plaintext, Markdown etc.);
* `comment` - comment (block & line) sections in programming languages, also LaTeX;
* `string` - strings in programming languages.

`spellright.spellContextByClass: {}`

Overrides setting of `spellContext` per document type. Accepts object of key-value pairs. For example following settings:

```JSON
spellright.spellContextByClass: {
    "latex": "body",
    "cpp": "comments",
    "python": "strings"
}
```

* disables spelling of comments in LaTeX documents;
* disables spelling of strings in CPP documents;
* disables spelling of comments in Python documents.

## In-Document Commands

Beside global settings following commands can be embedded inside spelled parts of the document (e.g.: comments, strings etc.):

<code>spellcheck&#x2d;language&nbsp;CODE</code> (alternative syntax: <code>spellcheck:&nbsp;language&nbsp;CODE</code>)

Forces **switching spelling language** for the following part of the document or until next <code>spellcheck&#x2d;language&nbsp;CODE</code> command. `CODE` is language code according to used spellcheck background service, typically in a LANGUAGE or LANGUAGE-COUNTRY format (e.g.: "en", "fr", "en-US", "en-GB", "fr-CA", "pl-PL" etc.) If `CODE` is empty switches **back to default spelling language**.

`spellcheck-off` (alternative syntax: `spellcheck: off`)

Forces spelling **OFF** for the entire document despite global settings.

`spellcheck-on` (alternative syntax: `spellcheck: on`)

Forces spelling **ON** for the entire document despite global settings. Has higher priority than turning spelling off with both *In-Document* `spellcheck-off` command and `.spellignore` patterns.

## Ignore file

`.spellignore` file located in workspace root directory can be used to disable spelling for documents described by [gitignore](https://git-scm.com/docs/gitignore) syntax file patterns.

## Known Issues

* Hint box associated with "Bulb" Code Action has an ugly habit of wrapping text at certain width not at white/punctuation character thus suggestions got cut in weird places (this is probably more of a VSCode's issue).
* Status bar indicator is not always in the same place - other extensions that add items to status bar "compete" for the place and it jumps from the last to one before last position in some cases (as the above, this is probably more of a VSCode's issue).

## Notice

This extension can be considered a Work In Progress. Please report all the errors and/or annoyances that you see on the [issues](https://github.com/bartosz-antosik/vscode-spellright/issues) page.

## Release Notes

[Changelog](CHANGELOG.md)
