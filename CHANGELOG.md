# Change Log

## **1.0.15** released on 5th May 2017

- **Fix:** Word separation rules updated (period & apostrophe at the beginning of the word).
- **Change:** Native module recompiled for new Electron version that comes with VSCode 1.12.
- **Change:** Screenshots update.

## **1.0.12** released on 29th April 2017

- **New:** Global/workspace ignore list & regular expressions matched also on compound phrase, before separation of camel/snake case parts.
- **Change:** Significantly faster spelling of entire document (on save and document switch) especially for large documents.
- **Fix:** Word separation rules updated (period, curly braces, apostrophe).
- **Fix:** Small documentation improvements.

## **1.0.11** released on 26th April 2017

- **Fix:** Regression in word separation rules fixed ([#11](https://github.com/bartosz-antosik/vscode-spellright/issues/11)).

## **1.0.10** released on 25th April 2017

- **New:** CamelCase and snake_case separation & spelling.
- **New:** E-mails & URLs excluded from spelling in markdown/plaintext/LaTeX/source code documents.
- **Change:** Compound lexemes separation rules updated (period, quotation mark).
- **Change:** Code section excluded from spelling in Markdown documents ([#10](https://github.com/bartosz-antosik/vscode-spellright/issues/10)).
- **Change:** Small touches to text documents.

## **1.0.8** released on 19th April 2017

- **Fix:** Spell check improperly interprets punctuation with ignore lists  ([#7](https://github.com/bartosz-antosik/vscode-spellright/issues/7)).
- **Fix:** Global/workspace dictionary incorrectly saving & naming ([#8](https://github.com/bartosz-antosik/vscode-spellright/issues/8)).

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