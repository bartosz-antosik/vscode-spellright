# Change Log

## **1.0.7** released on 18th April 2017

- **New:** Skipping math enclosed between $...$ in LaTeX documents.
- **New:** Diagnostics information is updated dynamically about every second while spelling whole document (useful when spelling large files).
- **New:** Hunspell dictionaries (when using in Windows 7 which does not have Spell Check API) can be used from language selection list.
- **New:** Information about installing on Windows 7 in README.md ([#6](https://github.com/bartosz-antosik/vscode-spellright/issues/6)).
- **Change:** Word separation rules updated (question mark).
- **Change:** Small touches to text documents & GUI elements.
- **Fix:** Parsing error when line/block comment inside string in source code parser.

## **1.0.6** released on 13th April 2017

- **Change:** All processing shifted to Idle state to prevent main thread clogging in case of spelling large file ([#1](https://github.com/bartosz-antosik/vscode-spellright/issues/1)).
- **Change:** Word separation rules updated.
- **Change:** Small touches to text documents & GUI elements.
- **Fix:** Highlights disappear on edit when more than 250 spelling errors in document ([#2](https://github.com/bartosz-antosik/vscode-spellright/issues/2)).
- **Change:** Dictionary grouping by base language name ([#4](https://github.com/bartosz-antosik/vscode-spellright/issues/4)).
- **Fix:** Norwegian Bokmål dictionary/culture name corrected ([#5](https://github.com/bartosz-antosik/vscode-spellright/issues/5)).
- **Fix:** Regression in switching dictionary/off functionality.

## **1.0.0** released on 4th April 2017

- Initial release.