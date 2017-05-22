// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017 Bartosz Antosik. Licensed under the MIT License.
// -----------------------------------------------------------------------------

'use strict';

var path = require('path');
var fs = require('fs');
var vscode = require('vscode');
var mkdirp = require('mkdirp');
var jsonMinify = require('jsonminify');
var XRegExp = require('xregexp');
var ignore = require('ignore');
var spellchecker = require('spellchecker');

var langcode = require('../lib/langcode')
var doctype = require('../lib/doctype');
const parsers = require('../lib/parser');

var settings = null;
var spellignore = null;
var dictionaries = [];

var indicator = null;
var controller = null;

var SpellRight = (function () {

    function SpellRight() {
        this.diagnosticMap = {};
        this.regexpMap = [];
        this.lastChanges = null;
        this.lastSyntax = 0;
        this.spellingContext = [];
        this.updateInterval = 1000;
        this.hunspell = false;
    }

    SpellRight.prototype.dispose = function () {
        this.suggestCommand.dispose();
        this.ignoreWorkspaceCommand.dispose();
        this.ignoreGlobalCommand.dispose();
        this.lastChanges.dispose();
    };

    SpellRight.prototype.activate = function (context) {

        var subscriptions = context.subscriptions;
        this.extensionRoot = context.extensionPath;

        settings = this.getSettings();
        spellignore = this.getIgnore();

        // Force HUNSPELL - seems it does not work.
        //process.env['SPELLCHECKER_PREFER_HUNSPELL'] = 'true';

        // Detect HUNSPELL: Windows 7 & other that use Hunspell do not report
        // dictionaries available. Same if the environment variable
        // SPELLCHECKER_PREFER_HUNSPELL is set node-spellchecker will use
        // Hunspell instead of native service. It requires to list folder as
        // the list of available dictionaries.
        var _dictionaries = spellchecker.getAvailableDictionaries();
        this.hunspell = (_dictionaries.length === 0 || (typeof process.env.SPELLCHECKER_PREFER_HUNSPELL !== 'undefined'));

        this.collectDictionaries();

        this.prepareIgnoreRegExps();

        this.setDictionary(settings.language);

        indicator = new LanguageIndicator();
        controller = new LanguageIndicatorController(indicator);

        // add to a list of disposables
        context.subscriptions.push(controller);
        context.subscriptions.push(indicator);

        vscode.commands.registerCommand('spellright.createUpdateSettings', this.createUpdateSettings, this);
        vscode.commands.registerCommand('spellright.selectDictionary', this.selectDictionary, this);
        vscode.commands.registerCommand('spellright.setCurrentTypeOFF', this.setCurrentTypeOFF, this);
        vscode.commands.registerCommand('spellright.ignoreWorkspaceFromSelection', this.ignoreWorkspaceFromSelection, this);
        vscode.commands.registerCommand('spellright.ignoreGlobalFromSelection', this.ignoreGlobalFromSelection, this);

        this.suggestCommand = vscode.commands.registerCommand(
            SpellRight.suggestCommandId, this.fixSuggestionCodeAction, this);
        this.ignoreWorkspaceCommand = vscode.commands.registerCommand(
            SpellRight.ignoreWorkspaceCommandId, this.ignoreWorkspaceCodeAction, this);
        this.ignoreGlobalCommand = vscode.commands.registerCommand(
            SpellRight.ignoreGlobalCommandId, this.ignoreGlobalCodeAction, this);
        subscriptions.push(this);

        var _this = this;

        fs.watchFile(SpellRight.CONFIGFILE, { interval: 100 }, function (_old, _new) {
            settings = _this.getSettings();
            indicator.updateLanguageState();
        });

        fs.watchFile(SpellRight.IGNOREFILE, { interval: 100 }, function (_old, _new) {
            spellignore = _this.getIgnore();
        });

        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('spellright');

        // Disabled because the document (parameter of the event) contains
        // strange data like languageID set to 'plaintext' no mater what type
        // of document it refers to, text size is always 1 character etc.
        //
        //vscode.workspace.onDidOpenTextDocument(this.doInitiateSpellCheck, this, subscriptions);

        vscode.workspace.onDidCloseTextDocument(function (document) {
            _this.diagnosticCollection.delete(document.uri);
            _this.diagnosticMap[document.uri.toString()] = undefined;
        }, this, subscriptions);

        vscode.workspace.onDidSaveTextDocument(this.doInitiateSpellCheck, this, subscriptions);
        vscode.workspace.onDidChangeTextDocument(this.doDiffSpellCheck, this, subscriptions);

        vscode.window.onDidChangeVisibleTextEditors(function (editors) {
            editors.forEach((editor, index, array) => {
                var _document = editor._documentData._document;
                if (settings.documentTypes.indexOf(_document.languageId) != (-1)) {
                    _this.doInitiateSpellCheck(_document);
                }
            });
        }, null);

        vscode.window.onDidChangeActiveTextEditor(function (editor) {
            var _document = editor._documentData._document;
            if (settings.documentTypes.indexOf(_document.languageId) != (-1)) {
                _this.doInitiateSpellCheck(_document);
            }
        }, null);

        // register code actions provider for all languages
        vscode.languages.registerCodeActionsProvider('*', this);

        // Spell check all open documents
        vscode.window.visibleTextEditors.forEach((editor, index, array) => {
            var _document = editor._documentData._document;
            if (settings.documentTypes.indexOf(_document.languageId) != (-1)) {
                _this.doInitiateSpellCheck(_document);
            }
        });
    };

    SpellRight.prototype.deactivate = function () {
        fs.unwatchFile(SpellRight.CONFIGFILE);
        fs.unwatchFile(pellRight.IGNOREFILE);
    }

    SpellRight.prototype.setCurrentTypeON = function () {
        // NOTE: This is strange: activeTextEditor.document is undefined.
        var _document = vscode.window.activeTextEditor._documentData;
        var _documenttype = _document._languageId;

        var _this = this;
        vscode.languages.getLanguages().then(function (_languages) {
            if (_languages.indexOf(_documenttype) != (-1)) {
                var _i = settings.documentTypes.indexOf(_documenttype);
                if (_i == (-1)) {
                    settings.documentTypes.push(_documenttype);
                }
                indicator.updateLanguageState();

                // Spell check current document
                _this.doInitiateSpellCheck(_document._document);
            }
        });
    }

    SpellRight.prototype.setCurrentTypeOFF = function () {
        // NOTE: This is strange: activeTextEditor.document is undefined.
        var _document = vscode.window.activeTextEditor._documentData;
        var _documenttype = _document._languageId;

        var _i = settings.documentTypes.indexOf(_documenttype);
        if (_i != (-1)) {
            settings.documentTypes.splice(_i);
            this.diagnosticCollection.delete(_document._uri);
        }
        indicator.updateLanguageState();

        if (SPELLRIGHT_DEBUG_OUTPUT)
            console.log('Spell check has been turned OFF for \"' + _documenttype + '\"" document type.');
    }

    SpellRight.prototype.collectDictionaries = function () {

        var _dictionaries = [];
        var languages = {};

        if (this.hunspell) {
            // Hunspell dictionaries are files in the directory
            if (fs.existsSync(this.getDictionariesPath())) {
                var dict = /(.*).(dic)/;
                var _files = fs.readdirSync(this.getDictionariesPath());
                for (var i = 0; i < _files.length; i++) {
                    var _file = _files[i];
                    if (dict.test(_file)) {
                        _dictionaries.push(dict.exec(_file)[1]);
                    }
                }
            } else {
//                vscode.window.showErrorMessage('[spellright] The path to dictionaries \"' + this.getDictionariesPath() + '\" does not exist.')
            }
        } else {
            // Other dictionaries are ISO language/culture pairs
            _dictionaries = spellchecker.getAvailableDictionaries();
        }

        dictionaries = [];

        var _this = this;
        _dictionaries.forEach(function (entry) {
            if (!_this.hunspell) {
                // Native spellcheckers - operate on ISO language codes
                var languageShort = langcode.code2Language(entry);
                if (typeof languageShort !== 'undefined') {
                    if (settings.groupDictionaries) {
                        // Group languages by main ISO entry.
                        if (languageShort in languages) {
                            languages[languageShort].push(entry);
                        } else {
                            languages[languageShort] = [entry];
                        }
                    } else {
                        // Report all language/culture entries.
                        dictionaries.push({
                            id: entry,
                            label: langcode.code2LanguageCulture(entry),
                            description: entry
                        });
                    }
                }
            } else {
                // Hunspell - operate on file names in designated directory
                var _label = entry;
                if (typeof langcode.code2LanguageCulture(entry) !== 'undefined') {
                    _label = langcode.code2LanguageCulture(entry);
                }
                dictionaries.push({
                    id: entry,
                    label: _label,
                    description: entry
                });
            }
        });

        for (var key in languages) {
            if (SPELLRIGHT_DEBUG_OUTPUT) {
                var _description = languages[key];
            } else {
                var _description = '';
            }

            dictionaries.push({
                id: langcode.language2Code(key),
                label: key,
                description: _description
            });
        }
    }

    SpellRight.prototype.selectDictionary = function() {

        var items = [];

        var _document = vscode.window.activeTextEditor._documentData;
        var _documenttype = _document._languageId;

        dictionaries.forEach(function (entry) {
            if (SPELLRIGHT_DEBUG_OUTPUT) {
                items.push({
                    label: '$(globe) ' + entry.label,
                    description: '[' + entry.description + ']'
                });
            } else {
                items.push({
                    label: '$(globe) ' + entry.label
                });
            }
        });

        items.push({
            label: '$(x) Turn OFF for Current Document Type',
            description: '[' + _documenttype + ']'
        });

        var options = {
            placeHolder: 'Select dictionary (language) or turn spelling OFF'
        };
        var _this = this;
        vscode.window.showQuickPick(items, options).then(function (selection) {
            if (typeof selection === 'undefined') {
                return;
            }

            var rdict = /\(globe\) (.*)/;
            var roff = /\(x\)/;

            if (rdict.test(selection.label)) {
                var dict = rdict.exec(selection.label)[1];
                dictionaries.forEach(function (entry) {
                    if (entry.label == dict) {
                        dict = entry.id;
                        return;
                    }
                });
            } else if (roff.test(selection.label)) {
                var off = roff.exec(selection.label);
            }

            _this.doCancelSpellCheck();

            if (!off) {
                _this.setDictionary(dict);
                _this.setCurrentTypeON();
            } else {
                _this.setCurrentTypeOFF();
            }
        });
    };

    SpellRight.prototype.splitCamelCase = function (word) {

        // CamelCase cases: HTMLScript, camelCase, CamelCase, innerHTML,
        // start0Case, snake_case, Snake_Case, HOMEToRent.
        var rcamel = XRegExp('(^[\\p{Ll}.@\']+)|[0-9]+|[\\p{Lu}.@\'][\\p{Ll}.@\']+|[\\p{Lu}.@\']+(?=[\\p{Lu}.@\'][\\p{Ll}.@\']|[0-9])|[\\p{Lu}.@\']+');

        var parts = [];
        XRegExp.forEach(word, rcamel, (match, i) => {
            parts.push({
                word: match[0],
                offset: match.index
            });
        });

        return parts;
    }

    SpellRight.prototype.splitSnakeCase = function (word) {

        // SnakeCase cases: HTML_Script, snake_Case, __test__.
        var rsnake = XRegExp('([^_]+)');
        var rsep = /_/;
        var parts = [];

        // We need a phantom split (e.g. for "_sth: case).
        if (rsep.test(word)) {
            parts.push({
                word: '',
                offset: 0
            });
        }

        XRegExp.forEach(word, rsnake, (match, i) => {
            parts.push({
                word: match[0],
                offset: match.index
            });
        });

        return parts;
    }

    SpellRight.prototype.splitByPeriodOrDigit = function (word) {

        // Split phrases with period inside `terminal.integrated.scrollback`.
        var rperiod = XRegExp('([^\.0-9]+)');
        var rsep = /[\.0-9]/;
        var parts = [];

        // We need a phantom split (e.g. for "2sth: case).
        if (rsep.test(word)) {
            parts.push({
                word: '',
                offset: 0
            });
        }

        XRegExp.forEach(word, rperiod, (match, i) => {
            parts.push({
                word: match[0],
                offset: match.index
            });
        });

        return parts;
    }

     SpellRight.prototype.prepareIgnoreRegExps = function () {
        for (var i = 0; i < settings.ignoreRegExps.length; i++) {
            // Convert the JSON of RegExp Strings into a real RegExp
            var flags = settings.ignoreRegExps[i].replace(/.*\/([gimy]*)$/, '$1');
            var pattern = settings.ignoreRegExps[i].replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
            pattern = pattern.replace(/\\\\/g, '\\');
            if (SPELLRIGHT_DEBUG_OUTPUT) {
                console.log('RegExp prepare: ' + settings.ignoreRegExps[i] + ' = /' + pattern + '/' + flags);
            }
            this.regexpMap.push(new RegExp(pattern, flags));
        }
    };

     SpellRight.prototype.testIgnoreRegExps = function (word) {
        for (var i = 0; i < this.regexpMap.length; i++) {
            if (word.match(this.regexpMap[i]) == word) {
                return true;
            }
        }
        return false;
    };

     SpellRight.prototype.testIgnoreWords = function (word) {
         for (var i = 0; i < settings.ignoreWords.length; i++) {
             if (settings.ignoreWords[i].toLowerCase() == word.toLowerCase())
                 return true;
         }
         return false;
     };

    SpellRight.prototype.checkAndMark = function (diagnostics, word, linenumber, colnumber) {

        var _linenumber = linenumber;
        var _colnumber = colnumber;

        // Words are selected by language specific parsers but from here on
        // they are treated in the same way so these are operations done on
        // every word/lexem spelled.

        cword = word;

        // Special case of words ending with period - abbreviations, etc.
        var _endsWithPeriod = cword.endsWith('.');
        var _endsWithApostrophe = cword.endsWith('\'');
        if (_endsWithPeriod || _endsWithApostrophe) {
            var cword = cword.slice(0, -1);
        }
        while (cword.startsWith('.') || cword.startsWith('\'')) {
            var cword = cword.slice(1);
            _colnumber++;
        }
        var _containsPeriod = /[.]/.test(cword);
        var _containsApostrophe = /[.]/.test(cword);

        // Before splitting make sure word is not in the ignore list or
        // regular expressions to ignore as a whole.
        if (this.testIgnoreWords(cword) || this.testIgnoreRegExps(cword)) {
            return;
        }

        // Split words containing period inside. Period does not break words
        // because it is part of legit abbreviations (e.g., i.e., etc.) which
        // should be spelled as well. So there can be lexems containing periods
        // inside. But they should be later on spelled as parts to minimize
        // the number of false positives.
        var _split = this.splitByPeriodOrDigit(cword);
        if (_split.length > 1) {
            var _this = this;
            _split.forEach (function(e) {
                if (e.word.length > 2) {
                    _this.checkAndMark(diagnostics, e.word, _linenumber, _colnumber + e.offset);
                }
            });
            return;
        }

        // Deal with CamelCase
        _split = this.splitCamelCase(cword);
        if (_split.length > 1) {
            var _this = this;
            _split.forEach(function (e) {
                if (e.word.length > 2) {
                    _this.checkAndMark(diagnostics, e.word, _linenumber, _colnumber + e.offset);
                }
            });
            return;
        }

        // Deal with snake_case
        _split = this.splitSnakeCase(cword);
        if (_split.length > 1) {
            var _this = this;
            _split.forEach(function (e) {
                if (e.word.length > 2) {
                    _this.checkAndMark(diagnostics, e.word, _linenumber, _colnumber + e.offset);
                }
            });
            return;
        }

        if (spellchecker.isMisspelled(cword)) {
            // Punctuation cleaned version of the word

            // Make sure word is not in the ignore list
            if (!this.testIgnoreWords(cword) || !this.testIgnoreRegExps(cword)) {

                // Special case of words ending with period  - if spelling
                // with dot at the end is correct contrary to spelling
                // without the dot then pass over.
                if (_endsWithPeriod) {
                    if (!spellchecker.isMisspelled(cword + '.')) {
                        return;
                    }
                }

                // Same case if it ends with apostrophe
                if (_endsWithApostrophe) {
                    if (!spellchecker.isMisspelled(cword + '\'')) {
                        return;
                    }
                }

                var lineRange = new vscode.Range(_linenumber, _colnumber, _linenumber, _colnumber + cword.length);

                var message = '\"' + cword + '\"';
                if (settings.suggestionsInHints) {
                    var suggestions = spellchecker.getCorrectionsForMisspelling(word);
                    if (suggestions.length > 0) {
                        var message = message + ': suggestions: ';
                        for (var _i = 0, suggestions_1 = suggestions; _i < suggestions_1.length; _i++) {
                            var s = suggestions_1[_i];
                            message += s + ', ';
                        }
                        message = message.slice(0, message.length - 2);
                    } else {
                        message += ': no suggestions';
                    }
                }

                var diag = new vscode.Diagnostic(lineRange, message, vscode.DiagnosticSeverity.Error);
                diag.source = 'spelling';

                // Now insert diagnostics at the right place
                var append = false;
                if (diagnostics.length > 0) {
                    var _drange = diagnostics[diagnostics.length - 1].range;
                    // At the end if fits there
                    var append = (_linenumber > _drange._end._line ||
                        (_linenumber == _drange._end._line &&
                        _colnumber >= _drange._end._character));
                } else {
                    // Definitely at the end!
                    var append = true;
                }

                if (append) {
                    diagnostics.push(diag);
                } else {
                    // Linear search. This should maybe be bisection or some
                    // other algorithm in the future, but on the other hand
                    // this code is called only on differential edits so there
                    // are very few calls thus it should not degrade
                    // performance much.
                    for (var i = 0; i < diagnostics.length; i++) {
                        var _drange = diagnostics[i].range;
                        if (_linenumber < _drange._end._line ||
                            (_linenumber <= _drange._end._line &&
                            _colnumber <= _drange._end._character)) {
                            diagnostics.splice(i, 0, diag);
                            break;
                        }
                    }
                }
            }
        }
    }

    SpellRight.prototype.interpretCommand = function (command, parameters) {
        if (this.spellingContext.length > 0) {
            if (command === 'on') {
                this.spellingContext[0]._enabled = true;
            } else if (command === 'off') {
                this.spellingContext[0]._enabled = false;
            }
        }
    }

    // Remove diagnostics in lines that were touched by change and in case
    // change brings any shift up/down - shift diagnostics.
    SpellRight.prototype.adjustDiagnostics = function (diagnostics,
        startline, endline, shift) {

        for (var i = diagnostics.length - 1; i >= 0; i--) {
            var _drange = diagnostics[i].range;
            if (_drange._start._line >= startline &&
                _drange._end._line <= endline) {
                // Remove diagnostics for changed lines range
                diagnostics.splice(i, 1);
            } else {
                // Adjust diagnostics behind changed lines range BEFORE
                if (shift != 0) {
                    if (_drange._end._line > endline) {
                        _drange._start._line += shift;
                        _drange._end._line += shift;
                    }
                }
            }
        }
    }

    SpellRight.prototype.doDiffSpellCheck = function (event) {

        // Is off for this document type?
        if (settings.documentTypes.indexOf(event.document.languageId) == (-1)) {
            return;
        }

        // Is language set to "none"?
        if (settings.language == '') {
            return;
        }

        var document = event.document;
        var parser = doctype.fromDocument(document);

        if (parser == null) {
            return
        };

        // Silently ignore files defined by spellright.ignoreFiles
        if (settings._ignoreFiles.ignores(path.relative(vscode.workspace.rootPath, document.uri._fsPath))) {
            return;
        }

        var _this = this;

        settings._commands.ignore = false;
        settings._commands.force = false;
        settings._commands.languages = [];

        parser.parseForCommands(document, function (command, parameters) {
            if (SPELLRIGHT_DEBUG_OUTPUT) {
                console.log('InDoc Command: ' + command + ' [' + parameters + ']');
            }
            if (command === 'off') {
                settings._commands.ignore = true;
            }
            if (command === 'on') {
                settings._commands.force = true;
            }
            if (command === 'language') {
                settings._commands.languages.push(parameters);
            }
        });

        // .spellignore tested here so it can be overriden by InDoc command(s)
        if (spellignore.ignores(path.relative(vscode.workspace.rootPath, document.uri._fsPath))) {
            settings._commands.ignore = true;
        }

        // State changed - update Status Bar indicator
        if (settings._commands.ignore || settings._commands.force) {
            indicator.updateLanguageState();
        }

        // Ignore spelling forced
        if (settings._commands.ignore && !settings._commands.force) {
            if (typeof this.diagnosticMap[document.uri.toString()] !== 'undefined') {
                this.diagnosticCollection.delete(document.uri);
                this.diagnosticMap[document.uri.toString()] = undefined;
            }
            return;
        }

        var _syntax_level = 0;

        if (typeof this.diagnosticMap[document.uri.toString()] === 'undefined') {
            this.doInitiateSpellCheck(document);
            return;
        }

        // If the document is being spelled (e.g. is large) adjust diagnostics
        // that are being prepared in the background, not those from the store.
        var diagnostics = [];

        if (this.spellingContext.length == 0) {
            diagnostics = this.diagnosticMap[document.uri.toString()];
        } else {
            diagnostics = this.spellingContext[0]._diagnostics;
        }

        // Calculate whether changes have shifted document lines up/down
        var shift = 0;

        for (var i = 0, l = event.contentChanges.length; i < l; i++) {
            var range = event.contentChanges[i].range;

            var _nlines = event.contentChanges[i].text.split('\n').length - 1;
            shift = _nlines - (range.end.line - range.start.line);
        }

        // Main incremental spell check loop: check change affected
        for (var i = 0, l = event.contentChanges.length; i < l; i++) {
            var range = event.contentChanges[i].range;

            this.adjustDiagnostics(diagnostics, range.start.line, range.end.line, shift);

            _syntax_level = parser.spellCheckRange(document, diagnostics, (diagnostics, token, linenumber, colnumber) => this.checkAndMark(diagnostics, token, linenumber, colnumber), (command, parameters) => this.interpretCommand(command, parameters), range.start.line, range.end.character, range.end.line + shift, range.end.character);
        }

        // Spell check trail left after changes/jumps
        if (this.lastChanges !== null) {

            for (var i = 0, l = this.lastChanges.length; i < l; i++) {
                var range = this.lastChanges[i].range;

                for (var j = 0, k = event.contentChanges.length; j < k; j++) {
                    var erange = event.contentChanges[j].range;
                    if (!(erange.start.line >= range.start.line &&
                        erange.end.line <= range.start.line)) {

                        if (range.start.line <= erange.start.line ||
                            range.end.line <= erange.end.line) {
                            shift = 0;
                        }

                        this.adjustDiagnostics(diagnostics, range.start.line + shift, range.end.line + shift, 0);

                        parser.spellCheckRange(document, diagnostics, (diagnostics, token, linenumber, colnumber) => this.checkAndMark(diagnostics, token, linenumber, colnumber), (command, parameters) => this.interpretCommand(command, parameters), range.start.line + shift, void 0, range.end.line + shift, void 0);
                    }
                }
            }
            this.lastChanges = null;
        }
        // Save it for next pass change/jump detection
        this.lastChanges = event.contentChanges;

        this.diagnosticCollection.set(document.uri, diagnostics);

        if (_syntax_level != this.lastSyntax) {
            this.lastSyntax = _syntax_level;
            this.doInitiateSpellCheck(document);
        }
    };

    SpellRight.prototype.doInitiateSpellCheck = function (document) {

        // Is off for this document type?
        if (settings.documentTypes.indexOf(document.languageId) == (-1)) {
            return;
        }

        // Is language set to "none"?
        if (settings.language == '') {
            return;
        }

        // Is this a private URI? (VSCode started having 'private:' versions
        // of non-plaintext documents with languageId = 'plaintext')
        if (document.uri.scheme != 'file' && document.uri.scheme != 'untitled') {
            return;
        }

        // Speller was already started
        var initiate = (this.spellingContext.length == 0);

        // Select appropriate parser
        const parser = doctype.fromDocument(document);

        // No parser for this type of document
        if (parser == null) {
            return;
        }

        var _context = {
            _document: document,
            _parser: parser,
            _diagnostics: [],
            _line: 0,
            _start: Date.now(),
            _update: Date.now(),
            _language: '',
            _enabled: true
        };

        // Silently ignore files defined by spellright.ignoreFiles
        if (settings._ignoreFiles.ignores(path.relative(vscode.workspace.rootPath, document.uri._fsPath))) {
            return;
        }

        var _this = this;
        var _length = this.spellingContext.length;

        settings._commands.ignore = false;
        settings._commands.force = false;
        settings._commands.languages = [];

        parser.parseForCommands(document, function (command, parameters) {
            if (SPELLRIGHT_DEBUG_OUTPUT) {
                console.log('InDoc Command: ' + command + ' [' + parameters + ']');
            }
            if (command === 'off') {
                settings._commands.ignore = true;
            }
            if (command === 'on') {
                settings._commands.force = true;
            }
            if (command === 'language') {
                settings._commands.languages.push(parameters);
            }
        });

        // .spellignore tested here so it can be overriden by InDoc command(s)
        if (spellignore.ignores(path.relative(vscode.workspace.rootPath, document.uri._fsPath))) {
            settings._commands.ignore = true;
        }

        // State changed - update Status Bar indicator
        if (settings._commands.ignore || settings._commands.force) {
            indicator.updateLanguageState();
        }

        // Ignore spelling forced
        if (settings._commands.ignore && !settings._commands.force) {
            if (typeof this.diagnosticMap[document.uri.toString()] !== 'undefined') {
                this.diagnosticCollection.delete(document.uri);
                this.diagnosticMap[document.uri.toString()] = undefined;
            }
            return;
        }

        this.spellingContext.pushIfNotExist(_context, function (e) {
            return e._document.uri === _context._document.uri;
        });

        if (initiate) {
            // The rest is done "OnIdle" state
            setImmediate(function () { _this.doStepSpellCheck(_this) });
        }

        if (_length != this.spellingContext.length) {
            if (SPELLRIGHT_DEBUG_OUTPUT) {
                console.log('Spelling of \"' + document.fileName + '\" [' + document.languageId + '] STARTED.');
            }
        }
    }

    SpellRight.prototype.doStepSpellCheck = function (_this) {

        if (_this.spellingContext.length == 0) {
            return;
        }

        if (_this.spellingContext[0]._line == 0) _this.spellingContext[0]._start = Date.now();

        var document = _this.spellingContext[0]._document;
        var parser = _this.spellingContext[0]._parser;
        var diagnostics = _this.spellingContext[0]._diagnostics;
        var line = _this.spellingContext[0]._line;
        var start = _this.spellingContext[0]._start;
        var update = _this.spellingContext[0]._update;

        if (line <= document.lineCount) {
            parser.spellCheckRange(document, diagnostics, (diagnostics, token, linenumber, colnumber) => _this.checkAndMark(diagnostics, token, linenumber, colnumber), (command, parameters) => this.interpretCommand(command, parameters), line, void 0, line + (SPELLRIGHT_LINES_BATCH - 1), void 0);

            // Update interface with already collected diagnostics
            if (this.updateInterval > 0) {
                if (Date.now() - update > this.updateInterval) {
                    _this.diagnosticCollection.set(document.uri, diagnostics);
                    _this.diagnosticMap[document.uri.toString()] = diagnostics;

                    _this.spellingContext[0]._update = Date.now();
                }
            }

            // Push spelling a line forward
            _this.spellingContext[0]._line += SPELLRIGHT_LINES_BATCH;

        } else {
            _this.diagnosticCollection.set(document.uri, diagnostics);
            _this.diagnosticMap[document.uri.toString()] = diagnostics;

            if (SPELLRIGHT_DEBUG_OUTPUT) {
                var end = Date.now();
                var secs = (end - start) / 1000;

                console.log('Spelling of \"' + document.fileName + '\" [' + document.languageId + '] COMPLETED in ' + String(secs) + 's, ' + String(diagnostics.length) + ' errors.');
            }

            // NULL document that has been finished
            _this.spellingContext.shift();
        }

        if (_this.spellingContext.length > 0) {
            setImmediate(function () { _this.doStepSpellCheck(_this, parser) });
        }
    }

    SpellRight.prototype.doCancelSpellCheck = function () {
        var _this = this;
        if (this.spellingContext[0] !== null) {
            this.spellingContext.forEach((context, index, array) => {
                _this.diagnosticCollection.set(context._document.uri, []);
                _this.diagnosticMap[context._document.uri.toString()] = undefined;

                if (SPELLRIGHT_DEBUG_OUTPUT) {
                    console.log('Spelling of \"' + context._document.fileName + '\" [' + context._document.languageId + '] CANCELLED.');
                }

                _this.spellingContext.shift();
            });
        }
    };

    SpellRight.prototype.provideCodeActions = function (document, range, context, token) {

        var diagnostic = context.diagnostics[0];
        if (!diagnostic) return null;

        if (settings.documentTypes.indexOf(document.languageId) == (-1) || (settings._commands.ignore && !settings._commands.force) || settings.language == '') {
            return null;
        }

        var rmatch = /\"(.*)\"/;
        var match = rmatch.exec(diagnostic.message);
        var word = '';
        if (match.length >= 2)
            word = match[1];
        if (word.length == 0)
            return undefined;

        // Punctuation cleaned version of the word
        var cword = word.replace(/[.,]/g, '');

        // Get suggestions
        var suggestions = spellchecker.getCorrectionsForMisspelling(word);
        var commands = [];
        if (word && word.length >= 2) {
            // Add suggestions to command list
            suggestions.forEach(function (suggestion) {
                commands.push({
                    title: suggestion,
                    command: SpellRight.suggestCommandId,
                    arguments: [document, diagnostic, word, suggestion]
                });
            });
            commands.push({
                title: 'Add \"' + cword + '\" to workspace ignore list',
                command: SpellRight.ignoreWorkspaceCommandId,
                arguments: [document, cword]
            });
            commands.push({
                title: 'Add \"' + cword + '\" to global ignore list',
                command: SpellRight.ignoreGlobalCommandId,
                arguments: [document, cword]
            });
        }
        return commands;
    };

    SpellRight.prototype.fixSuggestionCodeAction = function (document, diagnostic, word, suggestion) {
        var docWord = document.getText(diagnostic.range);
        if (word == docWord) {
            // Remove diagnostic from list
            var diagnostics = this.diagnosticMap[document.uri.toString()];
            var index = diagnostics.indexOf(diagnostic);
            diagnostics.splice(index, 1);

            // Update with new diagnostics
            this.diagnosticMap[document.uri.toString()] = diagnostics;
            this.diagnosticCollection.set(document.uri, diagnostics);

            // This is a way to cope with abbreviations ("etc.", "i.e." etc.)
            // words ending with period are selected to spell with period but
            // this may lead to either a proper abbreviation ("etc.") with
            // period or with in a word or few words without period. Then it
            // has to be added to revert to original phrasing.

            if (word.endsWith('.') && !suggestion.endsWith('.')) {
                suggestion += '.';
            }

            // Insert the new text
            var edit = new vscode.WorkspaceEdit();
            edit.replace(document.uri, diagnostic.range, suggestion);
            return vscode.workspace.applyEdit(edit);
        } else {
            vscode.window.showErrorMessage('The suggestion was not applied because it is outdated.');
        }
    };

    SpellRight.prototype.ignoreWorkspaceCodeAction = function (document, word) {
        if (this.addWordToWorkspaceIgnoreList(word, true)) {
            this.doInitiateSpellCheck(document);
        } else {
            vscode.window.showWarningMessage('The word \"' + word + '\" has already been added to workspace ignore list.');
        }
    };

    SpellRight.prototype.ignoreWorkspaceFromSelection = function () {
        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }

        var selection = editor.selection;
        if (selection.isSingleLine) {
            var text = editor.document.getText(selection);
            this.addWordToWorkspaceIgnoreList(text, true);
        } else {
            vscode.window.showInformationMessage('Can not ad multiline text to ignore list.');
        }
    }

    SpellRight.prototype.ignoreGlobalCodeAction = function (document, word) {
        if (this.addWordToGlobalIgnoreList(word)) {
            this.doInitiateSpellCheck(document);
        } else {
            vscode.window.showWarningMessage('The word \"' + word + '\" has already been added to global ignore list.');
        }
    };

    SpellRight.prototype.ignoreGlobalFromSelection = function () {
        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }

        var selection = editor.selection;
        if (selection.isSingleLine) {
            var text = editor.document.getText(selection);
            this.addWordToGlobalIgnoreList(text);
        } else {
            vscode.window.showInformationMessage('Can not ad multiline text to ignore list.');
        }
    }

    SpellRight.prototype.addWordToWorkspaceIgnoreList = function (word, save) {
        // Only add the word if it's not already in the list
        if (settings.ignoreWords.indexOf(word) < 0) {
            settings.ignoreWords.push(word);
            if (save) {
                this.saveWorkspaceSettings(settings);
            }
            return true;
        }
        return false;
    };

    SpellRight.prototype.addWordToGlobalIgnoreList = function (word) {
        if (this.addWordToWorkspaceIgnoreList(word, false)) {
            var userSettingsData = this.getUserSettings();
            if (Object.keys(userSettingsData).indexOf('spellright.ignoreWords') > 0) {
                if (userSettingsData['spellright.ignoreWords'].indexOf(word) < 0) {
                    userSettingsData['spellright.ignoreWords'].push(word);
                    this.saveUserSettings(userSettingsData);
                    return true;
                } else {
                    return false;
                }
            } else {
                userSettingsData['spellright.ignoreWords'] = [word];
                this.saveUserSettings(userSettingsData);
                return true;
            }
        }
        return false;
    };

    SpellRight.prototype.setDictionary = function (dictionary) {
        // Check if what we are trying to set is on the list of available
        // dictionaries. If not then set as [none], that is ''.
        settings.language = '';
        dictionaries.forEach(function (entry) {
            if (entry.id == dictionary) {
                settings.language = dictionary;
                return;
            }
        });

        if (settings.language === '') {
            return;
        }

        if (this.hunspell) {
            var _dict = settings.language;
            var _path = this.getDictionariesPath();
        } else {
            var _dict = settings.language;
            var _path = '[none]';
        }

        if (SPELLRIGHT_DEBUG_OUTPUT) {
            console.log('Dictionary (language) set to: \"' + _dict + '\" in \"' + _path + '\".');
        }
        spellchecker.setDictionary(_dict, _path);
    };

    SpellRight.prototype.getUniqueArray = function (array) {
        var a = array.concat();
        for (var i = 0; i < a.length; ++i) {
            for (var j = i + 1; j < a.length; ++j) {
                if (a[i] === a[j])
                    a.splice(j--, 1);
            }
        }
        return a;
    };

    SpellRight.prototype.getDictionariesPath = function () {
        var codeFolder = 'Code';
        if (vscode.version.indexOf('insider') >= 0)
            codeFolder = 'Code - Insiders';
        if (process.platform == 'win32')
            return path.join(process.env.APPDATA, codeFolder, 'Dictionaries');
        else if (process.platform == 'darwin')
            return path.join(process.env.HOME, 'Library', 'Application Support', codeFolder, 'Dictionaries');
        else if (process.platform == 'linux')
            return path.join(process.env.HOME, '.config', codeFolder, 'Dictionaries');
        else
            return '';

        if (!path.existsSync(this.getDictionariesPath()))
            return '';
    };

    SpellRight.prototype.getUserSettingsFilename = function () {
        var codeFolder = 'Code';
        if (vscode.version.indexOf('insider') >= 0)
            codeFolder = 'Code - Insiders';
        if (process.platform == 'win32')
            return path.join(process.env.APPDATA, codeFolder, 'User', 'settings.json');
        else if (process.platform == 'darwin')
            return path.join(process.env.HOME, 'Library', 'Application Support', codeFolder, 'User', 'settings.json');
        else if (process.platform == 'linux')
            return path.join(process.env.HOME, '.config', codeFolder, 'User', 'settings.json');
        else
            return '';
    };

    SpellRight.prototype.getUserSettings = function () {
        // Check user settings
        var userSettingsFilename = this.getUserSettingsFilename();
        if (userSettingsFilename.length > 0) {
            if (fs.existsSync(userSettingsFilename)) {
                var userSettingsFile = fs.readFileSync(userSettingsFilename, 'utf-8');
                // parse and remove any comment lines in the settings file
                return JSON.parse(jsonMinify(userSettingsFile));
            }
        }
        return null;
    };

    SpellRight.prototype.replacer = function (key, value) {
        if (key == '_ignoreFiles') return undefined;
        else if (key == '_commands') return undefined;
        else return value;
    }

    SpellRight.prototype.saveUserSettings = function (settings) {
        var userSettingsFilename = this.getUserSettingsFilename();
        if (userSettingsFilename.length > 0) {
            var data = '//\n// Spell Right global configuration file.\n//\n' + JSON.stringify(settings, this.replacer, 4);
            fs.writeFileSync(userSettingsFilename, data);
            return true;
        }
        else
            return false;
    };

    SpellRight.prototype.saveWorkspaceSettings = function (settings) {
        if (SpellRight.CONFIGFILE.length > 0) {
            try {
                var data = '//\n// Spell Right workspace configuration file.\n//\n' + JSON.stringify(settings, this.replacer, 4);
                mkdirp.sync(path.dirname(SpellRight.CONFIGFILE));
                fs.writeFileSync(SpellRight.CONFIGFILE, data);
            }
            catch (e) {
                if (SPELLRIGHT_DEBUG_OUTPUT) console.log(e);
            }
        }
    };

    SpellRight.prototype.getSettings = function () {
        var returnSettings = {
            language: 'en',
            documentTypes: ['markdown', 'latex', 'plaintext'],
            groupDictionaries: true,
            statusBarIndicator: true,
            suggestionsInHints: true,
            ignoreWords: [],
            ignoreRegExps: [],
            ignoreFiles: ['**/.gitignore', '**/.spellignore'],

            _ignoreFiles: {},
            _commands: {
                ignore: false, // spellcheck-off or .spellignore
                force: false, // spellcheck-on
                languages: []
            }
        };

        // Check user settings
        var userSettingsData = this.getUserSettings();
        if (userSettingsData) {
            Object.keys(returnSettings).forEach(function (key) {
                if ('spellright.' + key in userSettingsData) {
                    returnSettings[key] = userSettingsData['spellright.' + key];
                }
            });
        }
        if (SpellRight.CONFIGFILE.length == 0 && vscode.workspace.rootPath) {
            SpellRight.CONFIGFILE = path.join(vscode.workspace.rootPath, '.vscode', 'spellright.json');
        }
        if (SpellRight.CONFIGFILE.length > 0 && fs.existsSync(SpellRight.CONFIGFILE)) {

            var settings_1 = JSON.parse(jsonMinify(fs.readFileSync(SpellRight.CONFIGFILE, 'utf-8')));

            if (SPELLRIGHT_DEBUG_OUTPUT) {
                console.log('Configuration file: \"' + SpellRight.CONFIGFILE + '\".');
                console.log(settings_1);
            }

            Object.keys(returnSettings).forEach(function (key) {
                if (key in settings_1) {
                    if (Array.isArray(returnSettings[key]))
                        returnSettings[key] = this.getUniqueArray(returnSettings[key].concat(settings_1[key]));
                    else
                        returnSettings[key] = settings_1[key];
                }
            }, this);
        }
        else {
            if (SPELLRIGHT_DEBUG_OUTPUT)
                console.log('Configuration file: \"' + SpellRight.CONFIGFILE + '\" not found.');
        }

        returnSettings._ignoreFiles = ignore();

        returnSettings.ignoreFiles.forEach(function (key) {
            returnSettings._ignoreFiles.add(key);
        });

        return returnSettings;
    };

    SpellRight.prototype.getIgnore = function () {
        if (SpellRight.IGNOREFILE.length == 0 && vscode.workspace.rootPath) {
            SpellRight.IGNOREFILE = path.join(vscode.workspace.rootPath, '.spellignore');
        }

        if (fs.existsSync(SpellRight.IGNOREFILE)) {
            return ignore().add(fs.readFileSync(SpellRight.IGNOREFILE, 'utf-8'));
        } else {
            return ignore();
        }
    }


    SpellRight.prototype.createUpdateSettings = function () {

        if (SpellRight.CONFIGFILE.length > 0 && !fs.existsSync(SpellRight.CONFIGFILE)) {
            if (SPELLRIGHT_DEBUG_OUTPUT)
                console.log('Creating configuration file: \"' + SpellRight.CONFIGFILE + '\".');
            this.saveWorkspaceSettings(settings);
        }
        else if (fs.existsSync(SpellRight.CONFIGFILE)) {
            if (SPELLRIGHT_DEBUG_OUTPUT)
                console.log('Overwriting configuration file: \"' + SpellRight.CONFIGFILE + '\".');
            this.saveWorkspaceSettings(settings);
        }
        else {
            if (SPELLRIGHT_DEBUG_OUTPUT)
                console.log('Invalid configuration file name: \"' + SpellRight.CONFIGFILE + '\".');
        }
    };

    SpellRight.suggestCommandId = 'spellright.fixSuggestionCodeAction';
    SpellRight.ignoreWorkspaceCommandId = 'spellright.ignoreWorkspaceCodeAction';
    SpellRight.ignoreGlobalCommandId = 'spellright.ignoreGlobalCodeAction';

    SpellRight.CONFIGFILE = '';
    SpellRight.IGNOREFILE = '';

    return SpellRight;
}());

Object.defineProperty(exports, '__esModule', { value: true });
exports.default = SpellRight;

var LanguageIndicator = (function () {
    function LanguageIndicator() {
    }
    LanguageIndicator.prototype.dispose = function () {
        this.hideLanguage();
    };
    LanguageIndicator.prototype.updateLanguageState = function () {
        var location = vscode.StatusBarAlignment.Right;
        if (!this.statusBarItem) {
            this.statusBarItem = vscode.window.createStatusBarItem(location);
            this.statusBarItem.command = 'spellright.selectDictionary';
        }
        // Get the current text editor
        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            this.statusBarItem.hide();
            return;
        }
        var document = editor.document;

        var message = settings.language;
        var color = 'default';

        dictionaries.forEach(function (entry) {
            if (entry.id == settings.language) {
                message = entry.label;
                if (SPELLRIGHT_DEBUG_OUTPUT) {
                    message = message + ' [' + settings.language + ']';
                }
                return;
            }
        });

        if (settings.documentTypes.indexOf(document.languageId) == (-1) || (settings._commands.ignore && !settings._commands.force)) {
            message = '[off]';
            if (settings._commands.ignore && !settings._commands.force) {
                color = '#ff5858';
            }
        } else {
            if (settings.language == '') {
                message = '[none]';
            }
        }

        this.statusBarItem.text = '$(eye) ' + message;
        this.statusBarItem.color = color;
        this.statusBarItem.tooltip = 'Spell Checking Language & State';

        if (settings.statusBarIndicator) {
            this.statusBarItem.show();
        } else {
            this.statusBarItem.hide();
        }
    };
    LanguageIndicator.prototype.isLanguage = function (document) {
        var filePath = document.fileName;
        try {
            fs.accessSync(filePath, fs.W_OK);
            return false;
        }
        catch (error) {
            return true;
        }
    };
    LanguageIndicator.prototype.hideLanguage = function () {
        if (this.statusBarItem) {
            this.statusBarItem.dispose();
        }
    };
    return LanguageIndicator;
}());

exports.LanguageIndicator = LanguageIndicator;

var LanguageIndicatorController = (function () {
    function LanguageIndicatorController(idicator) {
        this.LanguageIndicator = idicator;
        this.LanguageIndicator.updateLanguageState();
        // subscribe to selection change and editor activation events
        var subscriptions = [];
        vscode.window.onDidChangeTextEditorSelection(this.onEvent, this, subscriptions);
        vscode.window.onDidChangeActiveTextEditor(this.onEvent, this, subscriptions);
        // create a combined disposable from both event subscriptions
        this.disposable = vscode.Disposable.from.apply(vscode.Disposable, subscriptions);
    }
    LanguageIndicatorController.prototype.dispose = function () {
        this.disposable.dispose();
    };
    LanguageIndicatorController.prototype.onEvent = function () {
        this.LanguageIndicator.updateLanguageState();
    };
    return LanguageIndicatorController;
}());

exports.LanguageIndicatorController = LanguageIndicatorController;
