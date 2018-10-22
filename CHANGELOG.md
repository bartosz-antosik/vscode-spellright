# Change Log

## **3.0.6** released on 22nd October 2018

- **Fix:** Spelling triggered on non valid document type (before document type is determined by extension) ([#222](https://github.com/bartosz-antosik/vscode-spellright/issues/222)).
- **Fix:** Expression determining emoji characters corrected ([#223](https://github.com/bartosz-antosik/vscode-spellright/issues/223)).

## **3.0.5** released on 16th October 2018

- **Change:** Temporary workaround for VSCode's error ([#60394](https://github.com/Microsoft/vscode/issues/60394)) updating diagnostics.

## **3.0.4** released on 8th October 2018

- **Change:** Better information on missing dictionary for language read from configuration and information on languages used in status bar tooltip in case of multiple languages selected ([#215](https://github.com/bartosz-antosik/vscode-spellright/issues/215)).
- **Fix:** Corrected behavior when language is not set, neither in user or workspace settings ([#215](https://github.com/bartosz-antosik/vscode-spellright/issues/215)).

## **3.0.2** released on 30th September 2018

- **Change:** Better discovery of VSCode's user settings folder name ([#211](https://github.com/bartosz-antosik/vscode-spellright/issues/211)).

## **3.0.0** released on 21st September 2018

- **New:** Added multi-language spelling without the need of inline documentation switches ([#171](https://github.com/bartosz-antosik/vscode-spellright/issues/171)).
- **New:** Added context menu screenshot. It is often confusing for new users that errors are not corrected with "right click" menu.
- **Change:** In-Document command `spellcheck-language "CODE" ["CODE"]*` can now accept multiple languages.
- **Change:** Series of minor changes and fixes (screenshots updated, GUI texts etc.)
- **Fix:** Option `spellright.configurationScope` set to `user` not working correctly for an out of workspace file ([#205](https://github.com/bartosz-antosik/vscode-spellright/issues/205)).
- **Fix:** Error assigning `spellright.parserByClass` when using GUI ([#205](https://github.com/bartosz-antosik/vscode-spellright/issues/205)).

## **2.5.32** released on 21st August 2018

- **New:** Added spelling for 'elixir' document type ([#198](https://github.com/bartosz-antosik/vscode-spellright/issues/198)).
- **Change:** Global prototype mutations removed & global constants renamed to ensure uniqueness ([#199](https://github.com/bartosz-antosik/vscode-spellright/issues/199)).

## **2.5.30** released on 12th August 2018

- **New:** First implementation of Quick Fixes available from Problems list ([#193](https://github.com/bartosz-antosik/vscode-spellright/issues/193)).
- **Change:** Regular expressions quoting rules changed to more natural (see `ignoreRegExps`, `ignoreRegExpsByClass` description in README.md for details).

## **2.5.28** released on 7th August 2018

- **Fix:** Incorrectly encoded accent acute in latex diacritics ([#192](https://github.com/bartosz-antosik/vscode-spellright/issues/192)).
- **Fix:** Silent crash when document symbols returned as undefined ([#190](https://github.com/bartosz-antosik/vscode-spellright/issues/190)).

## **2.5.24** released on 31st July 2018

- **New:** Configuration setting (`spellright.notificationClassByParser`) to change class of diagnostic messages produced by Spell Right per parser used ([#183](https://github.com/bartosz-antosik/vscode-spellright/issues/183)).
- **New:** Support for some rudimentary AsciiDoc constructs ([#188](https://github.com/bartosz-antosik/vscode-spellright/issues/188)).
- **Change:** Settings names wrapped in quotes in README.md ([#185](https://github.com/bartosz-antosik/vscode-spellright/issues/185)).

## **2.5.22** released on 24th July 2018

- **Change:** Further LaTeX [beamer](https://www.sharelatex.com/learn/Beamer) presentation package commands added to default value of `spellright.latexSpellParameters`.

## **2.5.20** released on 22nd July 2018

- **Fix:** Incorrect suggestion for misspelled words starting with period ([#181](https://github.com/bartosz-antosik/vscode-spellright/issues/181)).

## **2.5.18** released on 19th July 2018

- **Change:** VSCode's [portable mode](https://code.visualstudio.com/docs/editor/portable) has changed some things from unofficial portable version from some ago and hence saving words to user dictionary required changes ([#179](https://github.com/bartosz-antosik/vscode-spellright/issues/179)).

## **2.5.16** released on 9th July 2018

- **New:** Angular braces (`<>`) added to LaTeX commands.
- **New:** LaTeX bibliography (BibTex) magic comments (`!BIB`) removed from spelling.
- **Change:** Added `captionof` and `begin{frame}` to default value of `spellright.latexSpellParameters` to ease use of beamer presentation template in LaTeX.
- **Change:** Hunspell back end does not understand curly apostrophe ([#154](https://github.com/bartosz-antosik/vscode-spellright/issues/154)).
- **Change:** Way in which dots & parenthesis are processed in words changed a bit to help in some confusing situations.
- **Fix:** Problem with spelling only active document when multiple panes are opened aside each with document to spell.

## **2.5.4** released on 28th June 2018

- **New:** Absolute file locations in `spellright.ignoreFiles` ([#172](https://github.com/bartosz-antosik/vscode-spellright/issues/172)).
- **Fix:** Incorrect spelling of multiple trailing apostrophes ([#173](https://github.com/bartosz-antosik/vscode-spellright/issues/173)).

## **2.5.2** released on 13th June 2018

- **New:** Adding word to dictionary does not re-check whole document ([#160](https://github.com/bartosz-antosik/vscode-spellright/issues/160)).
- **New:** Language indicator in status bar shows multiple languages if effective language is altered by `spellright.languageContext` or `spellright.languageContextByClass` configuration settings (e.g. comments are spelled in different language than strings in source code document).
- **Fix:** Change in In-Document command changing spelling language did not re-check document.

## **2.5.0** released on 24th May 2018

- **New:** Configuration setting to enable/disable re-checking on save as a extension of ([#160](https://github.com/bartosz-antosik/vscode-spellright/issues/160)).

## **2.4.12** released on 21st May 2018

- **Fix:** Suggestions menu does not appear in an unsaved document ([#167](https://github.com/bartosz-antosik/vscode-spellright/issues/167)).
- **Fix:** Regression introduced when fixing recent issues in markdown ([#168](https://github.com/bartosz-antosik/vscode-spellright/issues/168)).

## **2.4.10** released on 20th May 2018

- **Fix:** In markdown replacing structures that are removed from spelling may create artifacts (like indented code blocks).
- **Fix:** Sometimes context menu does not show spelling suggestions if it overlaps with another diagnostics from another extension.
- **Fix:** Regression introduced by parenthetical plural ([#166](https://github.com/bartosz-antosik/vscode-spellright/issues/166)) and related error resulting in doubling period when correcting abbreviations.
- **Fix:** Hopefully corrected markdown code line detection regular expression which caused a very distant issue ([#163](https://github.com/bartosz-antosik/vscode-spellright/issues/163)).

## **2.4.9** released on 16th May 2018

- **Fix:** Regression in In-Document command `spellcheck-off` ([#161](https://github.com/bartosz-antosik/vscode-spellright/issues/161)).

## **2.4.8** released on 14th May 2018

- **New:** Document symbols (variables, function names etc.) used when spelling source code documents. Greatly reduces number of misspelled words in doc-strings and in comments whenever a symbol used in code is used. Cooperates with `spellright.useDocumentSymbolsInCode` configuration setting which is set to `true` by default.
- **Change:** Small change in the API of the upcoming version (currently in insiders build) caused suggestions (light bulb) stopped working ([#158](https://github.com/bartosz-antosik/vscode-spellright/issues/158)).
- **Fix:** Error "The suggestion was not applied because it is outdated" fixed ([#157](https://github.com/bartosz-antosik/vscode-spellright/issues/157)).
- **Fix:** Position goes haywire when backslash in front of LF ([#159](https://github.com/bartosz-antosik/vscode-spellright/issues/159)).
- **Fix:** Regression introduced by possessive apostrophe ([#150](https://github.com/bartosz-antosik/vscode-spellright/issues/150)).

## **2.3.5** released on 10th May 2018

- **Change:** Curly apostrophe (`’`) added to word separation rules as an equivalent to regular apostrophe ([#154](https://github.com/bartosz-antosik/vscode-spellright/issues/154)).
- **Change:** Screenshots updated.
- **Change:** Additional links to dictionaries for Windows 7 and Linux in README.md.

## **2.3.4** released on 7th May 2018

- **Change:** LaTeX 'magic comment' (`!TEX spellcheck = "CODE"`) changed as consequence of ([#151](https://github.com/bartosz-antosik/vscode-spellright/issues/151)) requires language code in double quotes.
- **Change:** Word separation rules extended with additional punctuation characters ([#151](https://github.com/bartosz-antosik/vscode-spellright/issues/151)).
- **Fix:** Incorrect dictionary name in block comments ([#151](https://github.com/bartosz-antosik/vscode-spellright/issues/151)). This changes the syntax of In-Document `spellcheck-language "CODE"` command: the language code/dictionary name has to be in double quotes.
- **Fix:** Regression introduced by parenthetical plural ([#152](https://github.com/bartosz-antosik/vscode-spellright/issues/152)).

## **2.3.3** released on 3rd May 2018

- **Fix:** Incorrect spell checking in Markdown fenced code blocks ([#151](https://github.com/bartosz-antosik/vscode-spellright/issues/151)).

## **2.3.2** released on 2nd May 2018

- **Change:** Screenshots updated.
- **Change:** Some solution to possessive apostrophe ([#150](https://github.com/bartosz-antosik/vscode-spellright/issues/150)).
- **Fix:** Regression with Hunspell backend introduced with fixing of ([#144](https://github.com/bartosz-antosik/vscode-spellright/issues/144)) also resolves ([#149](https://github.com/bartosz-antosik/vscode-spellright/issues/149)).

## **2.3.0** released on 26th April 2018

- **New:** LaTeX diacritics (e.g. `\"{o}`, `\l{}`, `\'{o}` etc.) in canonical form (that is no short forms, e.g. `\"o` supported for now) are now spelled as normal characters ([#133](https://github.com/bartosz-antosik/vscode-spellright/issues/133)).
- **Change:** Word separation rules extended with selected Chinese punctuation characters ([#143](https://github.com/bartosz-antosik/vscode-spellright/issues/143)).
- **Fix:** Regression introduced by parenthetical plural ([#144](https://github.com/bartosz-antosik/vscode-spellright/issues/144)).

## **2.2.16** released on 16th April 2018

- **Change:** Binaries updated for Electron 2.0.0-beta7 (insiders build at the moment).
- **Change:** Word separation rules updated with percent, chapeau-chinois and at-sign (#140).

## **2.2.14** released on 16th April 2018

- **Fix:** Another scenario of wrong document type identified when output console activated ([#139](https://github.com/bartosz-antosik/vscode-spellright/issues/139)).

## **2.2.12** released on 12th April 2018

- **New:** Spelling of parenthetical plurals (e.g. "process(es)") removes part in parenthesis from spelling to avoid false positive ([#135](https://github.com/bartosz-antosik/vscode-spellright/issues/135)).
- **Fix:** Wrong document type identified when output console activated ([#139](https://github.com/bartosz-antosik/vscode-spellright/issues/139)).
- **Fix:** Error when unknown dictionary encountered ([#138](https://github.com/bartosz-antosik/vscode-spellright/issues/138)).

## **2.2.8** released on 9th April 2018

- **New:** LANGUAGE-REGION separator characters can be mixed (e.g. en_GB & en-GB will be effectively treated same way) ([#136](https://github.com/bartosz-antosik/vscode-spellright/issues/136)).
- **New:** Context menu proposes to add compound word when part of camel/snake/digit separated word is misspelled ([#134](https://github.com/bartosz-antosik/vscode-spellright/issues/134)).

## **2.2.6** released on 4th April 2018

- **Fix:** Words with digits inside not checked correctly in local user dictionaries ([#133](https://github.com/bartosz-antosik/vscode-spellright/issues/133)).

## **2.2.2** released on 29th March 2018

- **Fix:** Multiline XML/HTML tags & tags inside XML/HTML comments in markdown break spelling ([#131](https://github.com/bartosz-antosik/vscode-spellright/issues/131)).

## **2.2.0** released on 27th March 2018

- **New:** Spelling documents' syntactic elements e.g. **comments** and **strings** in different languages ([#125](https://github.com/bartosz-antosik/vscode-spellright/issues/125)).
- **Fix:** Regression caused by fenced code blocks breaking markdown parser ([#131](https://github.com/bartosz-antosik/vscode-spellright/issues/131)).

## **2.1.34** released on 21st March 2018

- **Fix:** Indented fenced code blocks break markdown parser ([#128](https://github.com/bartosz-antosik/vscode-spellright/issues/128)).
- **Fix:** Emojis removed from spelling as they crash Hunspell both on Linux and Windows ([#127](https://github.com/bartosz-antosik/vscode-spellright/issues/127)).

## **2.1.32** released on 19th March 2018

- **Change:** In-Document `spellcheck-language` command's parameter may contain spaces now (e.g. dictionary names like `English (British)` are set correctly).
- **Change:** Added `jsonc` (JSON with Comments) to list of file types using code parser ([#127](https://github.com/bartosz-antosik/vscode-spellright/issues/127)).

## **2.1.30** released on 9th March 2018

- **New:** HTML comments spell checked in markdown parser (were removed 'en masse' in version 2.1.18) which originates from ([#122](https://github.com/bartosz-antosik/vscode-spellright/issues/122)).

## **2.1.28** released on 5th March 2018

- **New:** Prefix `mailto:` removed from spelling if in front of an e-mail address.

## **2.1.26** released on 1st March 2018

- **Fix:** Small fix for `spellright.latexSpellParameters` spelling, spin-off of ([#121](https://github.com/bartosz-antosik/vscode-spellright/issues/121)).

## **2.1.25** released on 1st March 2018

- **Fix:** Regression in removing LaTeX markup from spelling ([#121](https://github.com/bartosz-antosik/vscode-spellright/issues/121)).

## **2.1.24** released on 28th February 2018

- **New:** LaTeX magic comments (`!TEX`) removed from spelling ([#120](https://github.com/bartosz-antosik/vscode-spellright/issues/120)).
- **New:** Added spelling parser settings for LISP (comments & strings) source code files.
- **Fix:** LaTeX commands with nested curly braces improperly removed from spelling ([#120](https://github.com/bartosz-antosik/vscode-spellright/issues/120)).
- **Fix:** LaTeX commands (e.g. `bfseries`) embedded inside forced to spell commands `spellright.latexSpellParameters` not removed from spelling ([#120](https://github.com/bartosz-antosik/vscode-spellright/issues/120)).

## **2.1.22** released on 26th February 2018

- **Change:** LaTeX enhancement: `spellright.latexSpellParameters` extended with further commands that should have parameters spelled (32 in total, e.g. footnote, caption, multicolumn, href, hyperref, ..., author, title, section, subsection etc.)

## **2.1.20** released on 22nd February 2018

- **Change:** `spellright.latexSpellParameters` extended with default values: "subsubsection", "textbf", "textit", "underline" and "emph".
- **Fix:** Commands spanning on multiple lines in LaTeX incorrectly removed from spelling.
- **Fix:** Dictionaries not loaded properly in Windows 7 when no workspace opened ([#115](https://github.com/bartosz-antosik/vscode-spellright/issues/115)). Thanks to [@dozius](https://github.com/dozius).

## **2.1.18** released on 14th February 2018

- **Change:** XML/HTML tags removed from spelling in markdown parser.
- **Change:** Word separation rules updated with ampersand.
- **Change:** Configuration settings read/update for out of workspace files ([#110](https://github.com/bartosz-antosik/vscode-spellright/issues/110)).
- **Change:** `spellright.latexSpellParameters` extended with default values: "chapter" and "subsection".
- **Fix:** Checking of words with digit inside not working properly with Windows Spelling API.

## **2.1.14** released on 9th February 2018

- **Fix:** URLs & email addresses removed from spelling in XML parser ([#113](https://github.com/bartosz-antosik/vscode-spellright/issues/113)).

## **2.1.12** released on 29th January 2018

- **Fix:** Regression interfering with some markdown parser based documents ([#111](https://github.com/bartosz-antosik/vscode-spellright/issues/111)).

## **2.1.10** released on 22nd January 2018

- **Change:** Added `mediawiki` to list of file types using plaintext parser ([#109](https://github.com/bartosz-antosik/vscode-spellright/issues/109)).

## **2.1.8** released on 11th January 2018

- **Fix:** LaTeX double quotes not spelled correctly ([#108](https://github.com/bartosz-antosik/vscode-spellright/issues/108)).

## **2.1.2** released on 6th January 2018

- **Change:** Added `vue` to list of file types using XML parser ([#102](https://github.com/bartosz-antosik/vscode-spellright/issues/102)).

## **2.1.0** released on 28th December 2017

- **New:** Handling of unknown document type added via GUI and `spellright.parserByClass` configuration item ([#102](https://github.com/bartosz-antosik/vscode-spellright/issues/102), [#104](https://github.com/bartosz-antosik/vscode-spellright/issues/104)).
- **New:** New configuration item `spellright.configurationScope` allows to decide which configuration gets updated when `spellright.configurationUpdate` is set to `true`.
- **Change:** Configuration item `spellright.updateConfiguration` and command are renamed to `spellright.configurationUpdate` for consistency with new setting `spellright.configurationScope`.
- **Fix:** Better handling of distinction between inline code/bullet list in `markdown` document class ([#105](https://github.com/bartosz-antosik/vscode-spellright/issues/105)).

## **2.0.18** released on 18th December 2017

- **New:** Links to information on adding languages and languages available in Windows added to README.md ([#103](https://github.com/bartosz-antosik/vscode-spellright/issues/103)).
- **Fix:** Strings in 'makefile', 'r' and few other document classes were not spelled.

## **2.0.16** released on 13th December 2017

- **Change:** Added `todo` to list of file types using markdown parser ([#101](https://github.com/bartosz-antosik/vscode-spellright/issues/101)).
- **Fix:** Regression in markdown parser causing 'asciidoc' document type not being spelled.

## **2.0.15** released on 11th December 2017

- **Change:** Spell Right will create workspace configuration directory (`.vscode`) if it does not exists ([#99](https://github.com/bartosz-antosik/vscode-spellright/issues/99)).

## **2.0.14** released on 8th December 2017

- **New:** Refrain from spelling of tabbed code sections in `markdown` class documents and added new 'code' context to `spellright.spellContext` ([#100](https://github.com/bartosz-antosik/vscode-spellright/issues/100)).
- **New:** Added block (pod) comments when spelling `perl` class of documents ([#96](https://github.com/bartosz-antosik/vscode-spellright/issues/96)).

## **2.0.13** released on 5th December 2017

- **Fix:** Regression introduced for Linux platform by version 2.0.12 fixed ([#98](https://github.com/bartosz-antosik/vscode-spellright/issues/98)).

## **2.0.12** released on 2nd December 2017

- **Change:** Dictionaries path adjusted to work with [portable](https://github.com/garethflowers/vscode-portable) version of VSCode (Windows only). Extension of ([#53](https://github.com/bartosz-antosik/vscode-spellright/issues/53)).

## **2.0.10** released on 27th November 2017

- **Change:** Added `rmarkdown` to list of file types using markdown parser ([#94](https://github.com/bartosz-antosik/vscode-spellright/issues/94)).
- **Change:** Information added about document type not being yet supported by the Spell Right as an extension to ([#94](https://github.com/bartosz-antosik/vscode-spellright/issues/94)).

## **2.0.8** released on 24th November 2017

- **Change:** Better formatting of key shortcuts in README.md ([#92](https://github.com/bartosz-antosik/vscode-spellright/pull/92)). Thanks to [@janpio](https://github.com/janpio).
- **Fix:** Regression introduced with ([#90](https://github.com/bartosz-antosik/vscode-spellright/issues/90)) fixed ([#93](https://github.com/bartosz-antosik/vscode-spellright/issues/93)).

## **2.0.7** released on 23rd November 2017

- **Fix:** Word separation rules updated with apostrophe - adding `word` to dictionary doesn't make Spell Right recognize `word's` ([#90](https://github.com/bartosz-antosik/vscode-spellright/issues/90)).

## **2.0.6** released on 17th November 2017

- **New:** New setting `spellright.latexSpellParameters` to point LaTeX commands (e.g. `\title`, `\author`, `\date`, `\section` etc.) that should have parameters spelled. Created extending the request from issue ([#84](https://github.com/bartosz-antosik/vscode-spellright/issues/84)).
- **Change:** Regular expression for filtering LaTeX commands corrected to include unnumbered versions of some outline commands (like `\section*{}`).

## **2.0.5** released on 13th November 2017

- **Fix:** Sometimes not entire document spelled with correct language after switching (configuration updated too many times during switch process).

## **2.0.4** released on 9th November 2017

- **Fix:** No light bulb and menu with suggestions for single character misspellings ([#89](https://github.com/bartosz-antosik/vscode-spellright/issues/89)).

## **2.0.2** released on 6th November 2017

- **New:** Settings do not have to be persistent (see `spellright.updateConfiguration` configuration setting & `SpellRight: Update Configuration` command) ([#87](https://github.com/bartosz-antosik/vscode-spellright/issues/87)).
- **Change:** No `Add (...) to workspace dictionary` in suggestions menu when no workspace opened.
- **Fix:** Adding to user/workspace dictionary did not work immediately as it did before version 2.0 and as it should ([#88](https://github.com/bartosz-antosik/vscode-spellright/issues/88)).
- **Fix:** Removing spelling document type from status bar switch caused removal of all document types added later.
- **Fix:** Incorrectly adjusted diagnostics (in differential edit notifications, the algorithm that spells only what has changed during normal editing of the document) when document contains not OS default new line characters.

## **2.0.0** released on 2nd November 2017

- **New:** Multi Root Workspace ready with all the settings and custom workspace dictionaries having "resource" scope (that is per component root folder). It allows to e.g. have root folders with various languages, document types or custom dictionaries considered for spelling. Users of single root workspaces should not feel any difference to the way it was working so far with the exception of the point below.
- **New:** All the workspace settings are now stored in workspace settings file (`settings.json`) managed by VSCode. It is more in line with recommendations and seems bit more future proof. Current settings can be manually transferred from currently used dedicated workspace settings files (`spellright.json`) remembering that each setting has to be preceded by `spellright.` prefix.
- **New:** Selecting dictionary (language) or switching document class ON/OFF is now persistent and automatically stored in workspace settings if workspace is open or user settings if not.
- **New:** New setting `spellright.ignoreRegExpsByClass` allow to add regular expressions that will be ignored in spelling of a document of particular document class. Created extending the request from ([#78](https://github.com/bartosz-antosik/vscode-spellright/issues/78)).
- **Change:** Heavily refactored & simplified code. Although tested, may bring annoyances for which I am sorry. Please report on issues page.
- **Change:** Added `madoko` to list of file types using markdown parser ([#85](https://github.com/bartosz-antosik/vscode-spellright/issues/85)).

## **1.2.24** released on 20th October 2017

- **Change:** Added `ink` scripting language to list of file types using plaintext parser ([#81](https://github.com/bartosz-antosik/vscode-spellright/pull/81)). Thanks to [@segphault](https://github.com/segphault).
- **Fix:** Bad recognition of syntax elements in some conditions while spelling source code files ([#80](https://github.com/bartosz-antosik/vscode-spellright/issues/80)).

## **1.2.22** released on 18th October 2017

- **Change:** Screenshots updated.
- **Fix:** Code refactoring caused regression: Extension not working at all when used without folder (workspace) open ([#79](https://github.com/bartosz-antosik/vscode-spellright/issues/79)).

## **1.2.20** released on 16th October 2017

- **Fix:** Regression ([#77](https://github.com/bartosz-antosik/vscode-spellright/issues/77)) introduced in 2.17: Failure when spelling programming languages which do not contain multiline string definition.

## **1.2.18** released on 11th October 2017

- **Change:** Added `erb` (Embedded Ruby) to list of file types using XML parser ([#74](https://github.com/bartosz-antosik/vscode-spellright/pull/74)). Thanks to [@segphault](https://github.com/segphault).

## **1.2.17** released on 9th October 2017

- **Change:** Multiline strings not spelled in Python ([#73](https://github.com/bartosz-antosik/vscode-spellright/issues/73)).

## **1.2.16** released on 6th October 2017

- **Fix:** Regression introduced in 2.12: Words composed only of dashes (e.g. horizontal rules in comments) considered misspelled when used with Hunspell back end.

## **1.2.15** released on 3rd October 2017

- **New:** Added spelling parser settings for Git Commit Message & Git Rebase Message document types ([#71](https://github.com/bartosz-antosik/vscode-spellright/issues/71)).
- **Change:** Icon touched a bit.

## **1.2.12** released on 3rd October 2017

- **New:** Spelling of words separated by dash as a whole not only as parts ([#70](https://github.com/bartosz-antosik/vscode-spellright/issues/70)).

## **1.2.10** released on 26th September 2017

- **New:** Added support for LaTeX 'magic comment' (`!TEX spellcheck = CODE`) which allow to switch spelling language inside LaTeX document, functionally identical to an `spellcheck-language CODE` In-Document command.

## **1.2.8** released on 20th September 2017

- **New:** Native module bindings for RPM based Linux distributions like RHEL, Fedora, CentoOS etc. ([#69](https://github.com/bartosz-antosik/vscode-spellright/issues/69)).

## **1.2.2** released on 15th September 2017

- **New:** Added spelling parser settings for Julia (comments & strings) source code files and Julia Markdown documents ([#68](https://github.com/bartosz-antosik/vscode-spellright/issues/68)).
- **New:** Extension can have multiple workspace dictionaries contained in `*.dict` files which may be useful to have separate dictionaries of medical terms, trademark names etc. ([#65](https://github.com/bartosz-antosik/vscode-spellright/issues/65)).
- **New:** New icon & documentation updates.
- **Fix:** In-Document commands parsing in strings stopped parsing of In-Document commands.

## **1.1.40** released on 12th September 2017

- **Fix:** Compound (e.g. CamelCase) words not consulted as whole with main spelling engine ([#66](https://github.com/bartosz-antosik/vscode-spellright/issues/66)).

## **1.1.38** released on 11th September 2017

- **Change:** Regular expression from `spellright.ignoreRegExps` settings item are now matched against raw document not extracted words to spell. This is a huge change and allows to eliminate parts of document from spelling, like LaTeX `\begin{equation} ... \end{equation}` sections etc. ([#64](https://github.com/bartosz-antosik/vscode-spellright/issues/64)).

## **1.1.34** released on 7th September 2017

- **New:** Added spelling parser settings for 'D' (comments & strings) source code files ([#63](https://github.com/bartosz-antosik/vscode-spellright/issues/63)).
- **New:** Added multiline strings parsing to source code parser, following requirements in ([#63](https://github.com/bartosz-antosik/vscode-spellright/issues/63)).

## **1.1.32** released on 5th September 2017

- **Change:** Word separation rules updated with tilde ('~') character which is used as non breaking space in LaTeX ([#62](https://github.com/bartosz-antosik/vscode-spellright/issues/62)).
- **Change:** Optimized spelling of whole document when In-Document Commands (like `spellcheck-off` etc.) are modified.

## **1.1.31** released on 1st September 2017

- **Fix:** Error in setting name in configuration contribution point (`spellright.notificationType` vs. `spellright.notificationClass`) ([#61](https://github.com/bartosz-antosik/vscode-spellright/issues/61)). Thanks to [@James-Yu](https://github.com/James-Yu) for the hint.

## **1.1.30** released on 30th August 2017

- **Change:** Comment in workspace configuration file removed ([#60](https://github.com/bartosz-antosik/vscode-spellright/issues/60)).

## **1.1.26** released on 28th August 2017

- **Change:** Native module bindings for Electron version 1.7.4 (insiders preview) for all three platforms.
- **Change:** Documentation in README.md polished in places.

## **1.1.25** released on 25th August 2017

- **Change:** Recently introduced `spellright.spellSyntax` renamed to `spellright.spellContext` and `spellright.spellSyntaxByClass` renamed to `spellright.spellContextByClass` respectively.
- **Fix:** Wrong syntactic identification of specific strings in programming languages parser ([#59](https://github.com/bartosz-antosik/vscode-spellright/issues/59)).
- **Fix:** 'Add to workspace dictionary' doesn't make red squiggle disappear immediately ([#58](https://github.com/bartosz-antosik/vscode-spellright/issues/58)).

## **1.1.24** released on 24th August 2017

- **New:** Spelling of body/comments/strings of documents & source code can be selectively enabled/disabled in configuration settings globally (`spellright.spellSyntax`) and per document type (`spellright.spellSyntaxByClass`) following inquiry ([#40](https://github.com/bartosz-antosik/vscode-spellright/issues/40)).

## **1.1.22** released on 22nd August 2017

- **Change:** CamelCase word is marked as correct when only one part was corrected ([#46](https://github.com/bartosz-antosik/vscode-spellright/issues/46)).
- **Change:** Undo editor action doesn't trigger word re-check ([#47](https://github.com/bartosz-antosik/vscode-spellright/issues/47)).
- **Fix:** Switching dictionaries often with Hunspell backend causes high CPU usage ([#51](https://github.com/bartosz-antosik/vscode-spellright/issues/51)).

## **1.1.16** released on 20th August 2017

- **New:** New commands to add text selected in editor to User/Workspace dictionary ([#43](https://github.com/bartosz-antosik/vscode-spellright/issues/43)).
- **New:** Configuration setting (`spellright.notificationClass`) to change class of diagnostic messages produced by Spell Right ([#49](https://github.com/bartosz-antosik/vscode-spellright/issues/49)).

## **1.1.14** released on 17th August 2017

- **New:** Added spelling parser settings for 'HTTP' (comments) document type (used by REST Client Extension, [#41](https://github.com/bartosz-antosik/vscode-spellright/issues/41)).
- **Change:** Documentation updated with dictionary reuse hint for Linux systems ([#45](https://github.com/bartosz-antosik/vscode-spellright/issues/45)). Thanks to [@slodki](https://github.com/slodki) for the hint.

## **1.1.12** released on 16th August 2017

- **Fix:** Spell Right starts off enabled when configured not to ([#48](https://github.com/bartosz-antosik/vscode-spellright/issues/48)).
- **Fix:** Right suggestion for wrong CamelCase word part displayed ([#44](https://github.com/bartosz-antosik/vscode-spellright/issues/44)).
- **Fix:** Language selected for file is reset to none after adding word to user dictionary ([#42](https://github.com/bartosz-antosik/vscode-spellright/issues/42)).

## **1.1.10** released on 14th August 2017

- **Fix:** Extensions fails to load when there's a trailing comma in settings.json ([#39](https://github.com/bartosz-antosik/vscode-spellright/issues/39)). Many thanks to [@DamianPereira](https://github.com/DamianPereira) for nailing the problem.

## **1.1.8** released on 12th August 2017

- **Change:** Removed spelling for compiler directives in 'Pascal' document type.

## **1.1.6** released on 11th August 2017

- **New:** Support for **macOS** and **Linux**.
- **Fix:** Turning off Spell Right leaves it stuck in enabled mode in other Editors ([#37](https://github.com/bartosz-antosik/vscode-spellright/issues/37)) and quick fix to quick fix ([#38](https://github.com/bartosz-antosik/vscode-spellright/issues/38)).

## **1.0.42** released on 6th August 2017

- **Change:** Some math expressions in latex should not be spelled ([#35](https://github.com/bartosz-antosik/vscode-spellright/issues/35)).
- **Change:** LaTeX parser now excludes more types of math braces, that is: `\(` ... `\)` and `\[` ... `\]` ([#34](https://github.com/bartosz-antosik/vscode-spellright/issues/34)).

## **1.0.40** released on 4th August 2017

- **New:** Added spelling parser settings for 'Pascal' (comments & strings) document type.
- **Change:** README.md polished a bit (wrong Unicode characters prevented **In-Document** commands from being ready to cut & paste to use).

## **1.0.36** released on 2nd August 2017

- **New:** Added spelling for 'AsciiDoc' document type ([#30](https://github.com/bartosz-antosik/vscode-spellright/issues/30)).
- **Change:** Custom words are no longer stored in user/workspace configuration files but in dedicated `spellright.dict` files located in User and/or Workspace directories. It is meant to be easier to edit, compare, synchronize etc. custom lists of words considered as spelled correctly.
- **Change:** New settings flag `addToSystemDictionary` allows to store words added to user dictionary in appropriate system default custom spelling dictionary [#28](https://github.com/bartosz-antosik/vscode-spellright/issues/28).
- **Fix:** Multiple languages in document code action (bulb) suggestions always in default language ([#33](https://github.com/bartosz-antosik/vscode-spellright/issues/33)).

## **1.0.32** released on 25th July 2017

- **Change:** Added binary dependencies for both ia32 and x64 architectures on Windows. Should work in both 32 and 64-bit builds of Visual Studio Code on 64-bit Windows ([#29](https://github.com/bartosz-antosik/vscode-spellright/issues/29)). Many thanks to [@Moberstein](https://github.com/Moberstein), [@borekb](https://github.com/borekb), [@Eldaw](https://github.com/Eldaw) for nailing problem around it.

## **1.0.27** released on 12th July 2017

- **Change:** URLs in Markdown link excluded from spelling ([#27](https://github.com/bartosz-antosik/vscode-spellright/issues/27)).

## **1.0.25** released on 9th July 2017

- **New:** User settings are now watched for changes and reloaded after change (no restart required).

## **1.0.24** released on 4th July 2017

- **Change:** Inline code excluded from spelling in Markdown documents because of ([#24](https://github.com/bartosz-antosik/vscode-spellright/issues/24)) and as a consequence of ([#10](https://github.com/bartosz-antosik/vscode-spellright/issues/10)).
- **Change:** Dictionary grouping flag (`spellright.groupDictionaries`) exposed in settings.

## **1.0.23** released on 2nd July 2017

- **Change:** Word separation rules updated (pipe character).
- **Fix:** Extension improperly initialized spelling language in certain circumstances ([#23](https://github.com/bartosz-antosik/vscode-spellright/issues/23)).

## **1.0.22** released on 9th June 2017

- **Change:** Skipping Code Blocks from spelling in reStructuredText documents ([#20](https://github.com/bartosz-antosik/vscode-spellright/issues/20)).
- **Fix:** Language switching regression introduced by multiple languages in one document ([#21](https://github.com/bartosz-antosik/vscode-spellright/issues/21)).
- **Fix:** Incorrect reloading of `spellright.ignoreRegExps` when watching for manual file change.

## **1.0.21** released on 7th June 2017

- **Change:** Added spelling for 'reStructuredText' file type ([#19](https://github.com/bartosz-antosik/vscode-spellright/issues/19)).

## **1.0.20** released on 1st June 2017

- **New:** In-Document command to switch between languages in one document (see `spellcheck-language` in README.md).

## **1.0.19** released on 30th May 2017

- **Fix:** One wrong RegExp in `spellright.ignoreRegExps` will prevent other RegExps to be applied ([#18](https://github.com/bartosz-antosik/vscode-spellright/issues/18)). Many thanks to [@eilsustc](https://github.com/neilsustc) for help nailing this.

## **1.0.18** released on 23rd May 2017

- **New:** New settings item `ignoreFiles` to allow globally define files to be ignored (in reference to [#16](https://github.com/bartosz-antosik/vscode-spellright/issues/16)).
- **Change:** Screenshots & documents polished a bit.
- **Change:** Keywords provided in package metadata for easier reference.
- **Fix:** Status bar indicator show/hide functionality & coloring corrected ([#17](https://github.com/bartosz-antosik/vscode-spellright/issues/17)).

## **1.0.17** released on 20th May 2017

- **New:** In-Document commands to allow disabling/enabling spelling for the document independent of the global settings ([#14](https://github.com/bartosz-antosik/vscode-spellright/issues/14)).
- **New:** Status Bar indicator shows spelling state respecting the In-Document commands and `.spellignore` file actions (Language name when spelling enabled, OFF in white when disabled for document class; OFF in red when disabled by In-Document commands or `.spellignore` file pattern).
- **New:** Workspace settings `spellright.json` file is watched for changes (e.g. manually editing list of ignored words) and is reloaded in case it has been altered on the disk.
- **New:** Ignore file `.spellignore` located in workspace root directory allows to disable spelling for files indicated by [gitignore](https://git-scm.com/docs/gitignore) syntax patterns ([#16](https://github.com/bartosz-antosik/vscode-spellright/issues/16)). Also watched for changes.
- **Change:** Word separation rules updated (digit at the beginning/end, hash, dollar sign).
- **Fix:** Wrong file type handling in split view ([#15](https://github.com/bartosz-antosik/vscode-spellright/issues/15)).

## **1.0.16** released on 9th May 2017

- **Change:** Word separation rules updated (digit inside a word).
- **Change:** Spelling enabled for 'mustache' file type ([#13](https://github.com/bartosz-antosik/vscode-spellright/issues/13)).
- **Fix:** Global setting should be "spellright.documentTypes" not "spellright.documentType" ([#12](https://github.com/bartosz-antosik/vscode-spellright/issues/12)).

## **1.0.15** released on 5th May 2017

- **Change:** Native module recompiled for new Electron version that comes with VSCode 1.12.
- **Change:** Screenshots update.
- **Fix:** Word separation rules updated (period & apostrophe at the beginning of the word).

## **1.0.12** released on 29th April 2017

- **New:** Global/workspace dictionaries & regular expressions matched also on compound phrase, before separation of camel/snake case parts.
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

- **Fix:** Spell check improperly interprets punctuation with custom dictionary words ([#7](https://github.com/bartosz-antosik/vscode-spellright/issues/7)).
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