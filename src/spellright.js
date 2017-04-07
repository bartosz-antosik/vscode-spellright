// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017 Bartosz Antosik. MIT license.
// -----------------------------------------------------------------------------

'use strict';

var path = require('path');
var fs = require('fs');
var vscode = require('vscode');
var mkdirp = require('mkdirp');
var jsonMinify = require('jsonminify');
var spellchecker = require('spellchecker');

var langcode = require('../lib/langcode')
var doctype = require('../lib/doctype');
const parsers = require('../lib/parser');

var settings;

var indicator;
var controller;

var SpellRight = (function () {

    function SpellRight() {
        this.diagnosticMap = {};
        this.lastChanges = null;
        this.spellingNow = [];
    }

    SpellRight.prototype.dispose = function () {
        this.suggestCommand.dispose();
        this.ignoreCommand.dispose();
        this.alwaysIgnoreCommand.dispose();
        this.lastChanges.dispose();
    };

    SpellRight.prototype.activate = function (context) {

        var subscriptions = context.subscriptions;
        this.extensionRoot = context.extensionPath;

        settings = this.getSettings();
        this.setDictionary(settings.language);

        indicator = new LanguageIndicator();
        controller = new LanguageIndicatorController(indicator);

        // add to a list of disposables
        context.subscriptions.push(controller);
        context.subscriptions.push(indicator);

        vscode.commands.registerCommand('spellright.createUpdateSettings', this.createUpdateSettings, this);
        vscode.commands.registerCommand('spellright.selectDictionary', this.selectDictionary, this);
        vscode.commands.registerCommand('spellright.setCurrentTypeOFF', this.setCurrentTypeOFF, this);

        this.suggestCommand = vscode.commands.registerCommand(
            SpellRight.suggestCommandId, this.fixSuggestionCodeAction, this);
        this.ignoreCommand = vscode.commands.registerCommand(
            SpellRight.ignoreCommandId, this.ignoreWorkspaceCodeAction, this);
        this.alwaysIgnoreCommand = vscode.commands.registerCommand(
            SpellRight.alwaysIgnoreCommandId, this.ignoreGlobalCodeAction, this);
        subscriptions.push(this);

        var _this = this;

        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('spellright');

        // Disabled because the document (paremeter of the event) contains
        // strange data like languageID set to 'plaintext' no mater what type
        // of document it refers to, text size is always 1 character etc.
        //
        // vscode.workspace.onDidOpenTextDocument(this.doInitiateSpellCheck, this, subscriptions);

        vscode.workspace.onDidCloseTextDocument(function (textDocument) {
            _this.diagnosticCollection.delete(textDocument.uri);
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

        // register code actions provider for all languages
        vscode.languages.registerCodeActionsProvider('*', this);

        // Spell check all open documents
        if (typeof vscode.window.activeTextEditor !== 'undefined')
            this.doInitiateSpellCheck(vscode.window.activeTextEditor.document);
    };

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
                indicator.updateLanguage();

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
        indicator.updateLanguage();

        if (DEBUG_OUTPUT)
            console.log('Spell check has been turned OFF for \"' + _documenttype + '\"" document type.');
    }

    SpellRight.prototype.selectDictionary = function() {

        var items = [];

        var _document = vscode.window.activeTextEditor._documentData;
        var _documenttype = _document._languageId;

        spellchecker.getAvailableDictionaries().forEach(function(entry) {
            items.push({
                label: '$(globe) ' + langcode.code2LanguageCulture(entry),
                description: '[' + entry + ']' });
        });

        items.push({
            label: '$(x) Turn OFF for Current Document Type',
            description: '[' + _documenttype + ']'
        });

        var options = {
            placeHolder: 'Select spelling dictionary (language) or turn spelling OFF'
        };
        var _this = this;
        vscode.window.showQuickPick(items, options).then(function (selection) {
            if (typeof selection === 'undefined') {
                return;
            }
            var rdict = /\[(.*?)\]/g;
            var dict = rdict.exec(selection.description);

            var roff = /\(x\)/g;
            var off = roff.exec(selection.label);

            if (!off) {
                settings.language = dict[1].replace(/-/g, '_');
                _this.setDictionary(settings.language);
                _this.setCurrentTypeON();
            } else {
                _this.setCurrentTypeOFF();
            }
        });
    };

    SpellRight.prototype.checkAndMark = function (diagnostics, token, linenumber, colnumber) {

        if (spellchecker.isMisspelled(token)) {
            var lineRange = new vscode.Range(linenumber, colnumber, linenumber, colnumber + token.length);
            // Make sure word is not in the ignore list
            if (settings.ignoreWords.indexOf(token) < 0) {
                var message = '\"' + token + '\"';
                if (settings.suggestionsInHints) {
                    var suggestions = spellchecker.getCorrectionsForMisspelling(token);
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
                //diagnostics.unshift(diag);
                diagnostics.push(diag);
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

        // Check if not being spelled right now
        if (this.spellingNow.indexOf(event.document.uri.toString()) != (-1)) {
            return;
        }

        // Is off for this document type?
        if (settings.documentTypes.indexOf(event.document.languageId) == (-1)) {
            return;
        }

        var document = event.document;
        var speller = doctype.fromDocument(document);

        if (speller == null) return;

        if (typeof this.diagnosticMap[document.uri.toString()] === 'undefined') {
            this.doInitiateSpellCheck(document);
            return;
        }

        var diagnostics = this.diagnosticMap[document.uri.toString()];

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

            speller.spellCheckRange(document, diagnostics, (diagnostics, token, linenumber, colnumber) => this.checkAndMark(diagnostics, token, linenumber, colnumber), range.start.line, range.end.character, range.end.line + shift, range.end.character);
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

                        speller.spellCheckRange(document, diagnostics, (diagnostics, token, linenumber, colnumber) => this.checkAndMark(diagnostics, token, linenumber, colnumber), range.start.line + shift, void 0, range.end.line + shift, void 0);
                    }
                }
            }
            this.lastChanges = null;
        }
        // Save it for next pass change/jump detection
        this.lastChanges = event.contentChanges;

        this.diagnosticCollection.set(document.uri, diagnostics);
    };

    SpellRight.prototype.doInitiateSpellCheck = function (document) {

        // Check if not being spelled right now
        if (this.spellingNow.indexOf(document.uri.toString()) != (-1)) {
            return;
        }

        // Is off for this document type?
        if (settings.documentTypes.indexOf(document.languageId) == (-1)) {
            return;
        }

        // Is this a private URI? (VSCode started having 'private:' versions
        // of non-plaintext documents with languageId = 'plaintext')
        if (document.uri.scheme != 'file' && document.uri.scheme != 'untitled') {
            return;
        }

        var diagnostics = [];
        var linenumber = 0;
        var colnumber = 0;

        // Select appropriate parser
        const speller = doctype.fromDocument(document);

        if (speller == null) return;

        var _this = this;

        // Mark as being spelled
        this.spellingNow.push(document.uri.toString());

        if (DEBUG_OUTPUT) {
            console.log('Spelling of \"' + document.fileName + '\" [' + document.languageId + '] STARTED.');
            var start = new Date().getTime();
        }

        // The rest is done "OnIdle"" state
        setImmediate(function () { _this.doStepSpellCheck(_this, document, diagnostics, 0, speller, start) });
    }

    SpellRight.prototype.doStepSpellCheck = function (_this, document, diagnostics, line, speller, start) {

        if (line <= document.lineCount) {
            speller.spellCheckRange(document, diagnostics, (diagnostics, token, linenumber, colnumber) => _this.checkAndMark(diagnostics, token, linenumber, colnumber), line, void 0, line, void 0);

            setImmediate(function () { _this.doStepSpellCheck(_this, document, diagnostics, line + 1, speller, start) });
        } else {
            _this.diagnosticCollection.set(document.uri, diagnostics);
            _this.diagnosticMap[document.uri.toString()] = diagnostics;

            if (DEBUG_OUTPUT) {
                var end = new Date().getTime();
                var secs = (end - start) / 1000;

                console.log('Spelling of \"' + document.fileName + '\" [' + document.languageId + '] COMPLETED in ' + String(secs) + 's, ' + String(diagnostics.length) + ' errors.');
            }

            // Remove from being spelled
            var i = _this.spellingNow.indexOf(document.uri.toString());
            if (i !== (-1)) {
                _this.spellingNow.splice(i, 1);
            }
        }
    }

    SpellRight.prototype.processUserIgnoreRegex = function (text) {
        for (var i = 0; i < settings.ignoreRegExp.length; i++) {
            // Convert the JSON of RegExp Strings into a real RegExp
            var flags = settings.ignoreRegExp[i].replace(/.*\/([gimy]*)$/, '$1');
            var pattern = settings.ignoreRegExp[i].replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
            pattern = pattern.replace(/\\\\/g, '\\');
            if (DEBUG_OUTPUT) {
                console.log(settings.ignoreRegExp[i]);
                console.log(pattern);
                console.log(flags);
            }
            var regex = new RegExp(pattern, flags);
            if (DEBUG_OUTPUT)
                console.log(text.match(regex));
            text = text.replace(regex, ' ');
        }
        return text;
    };

    SpellRight.prototype.provideCodeActions = function (document, range, context, token) {

        var diagnostic = context.diagnostics[0];
        if (!diagnostic) return null;

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
                title: 'Add \"' + cword + '\" to workspace dictionary',
                command: SpellRight.ignoreCommandId,
                arguments: [document, cword]
            });
            commands.push({
                title: 'Add \"' + cword + '\" to global dictionary',
                command: SpellRight.alwaysIgnoreCommandId,
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
            vscode.window.showErrorMessage('The suggestion was not applied because it is out of date.');
        }
    };

    SpellRight.prototype.ignoreWorkspaceCodeAction = function (document, word) {
        if (this.addWordToIgnoreList(word, true)) {
            this.doInitiateSpellCheck(document);
        } else {
            vscode.window.showWarningMessage('The word \"' + word + '\" has already been added to the ignore list.');
        }
    };

    SpellRight.prototype.ignoreGlobalCodeAction = function (document, word) {
        if (DEBUG_OUTPUT) {
            console.log(word);
            console.log(document);
            console.log(Object.keys(document));
        }
        if (this.addWordToAlwaysIgnoreList(word)) {
            this.doInitiateSpellCheck(document);
        } else {
            vscode.window.showWarningMessage('The word \"' + word + '\" has already been added to the ignore list.');
        }
    };

    SpellRight.prototype.addWordToIgnoreList = function (word, save) {
        // Only add the word if it's not already in the list
        if (settings.ignoreWords.indexOf(word) < 0) {
            settings.ignoreWords.push(word);
            this.saveWorkspaceSettings(settings);
            return true;
        }
        return false;
    };

    SpellRight.prototype.addWordToAlwaysIgnoreList = function (word) {
        if (this.addWordToIgnoreList(word, false)) {
            var userSettingsData = this.getUserSettings();
            if (Object.keys(userSettingsData).indexOf('spellchecker.ignoreWords') > 0) {
                if (userSettingsData['spellchecker.ignoreWords'].indexOf(word) < 0) {
                    userSettingsData['spellchecker.ignoreWords'].push(word);
                    this.saveUserSettings(userSettingsData);
                    return true;
                } else {
                    return false;
                }
            } else {
                userSettingsData['spellchecker.ignoreWords'] = [word];
                this.saveUserSettings(userSettingsData);
                return true;
            }
        }
        return false;
    };

    SpellRight.prototype.setDictionary = function (language) {

        if (language === void 0) { language = 'en_US'; }

        settings.language = language;

        if (DEBUG_OUTPUT)
            console.log('Dcitionary (language) set to: \"' + settings.language + '\".');

        spellchecker.setDictionary(settings.language, '');
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

    SpellRight.prototype.saveUserSettings = function (settings) {
        var userSettingsFilename = this.getUserSettingsFilename();
        if (userSettingsFilename.length > 0) {
            var data = '// Place your settings in this file to overwrite the default settings\n' + JSON.stringify(settings, null, 4);
            fs.writeFileSync(userSettingsFilename, data);
            return true;
        }
        else
            return false;
    };

    SpellRight.prototype.saveWorkspaceSettings = function (settings) {
        if (SpellRight.CONFIGFILE.length > 0) {
            try {
                mkdirp.sync(path.dirname(SpellRight.CONFIGFILE));
                fs.writeFileSync(SpellRight.CONFIGFILE, JSON.stringify(settings, null, 4));
            }
            catch (e) {
                if (DEBUG_OUTPUT) console.log(e);
            }
        }
    };

    SpellRight.prototype.getSettings = function () {
        var returnSettings = {
            language: 'en_US',
            documentTypes: ['markdown', 'latex', 'plaintext'],
            statusBarIndicator: true,
            suggestionsInHints: true,
            ignoreWords: [],
            ignoreRegExps: []
        };

        // Check user settings
        var userSettingsData = this.getUserSettings();
        if (userSettingsData) {
            Object.keys(returnSettings).forEach(function (key) {
                if (userSettingsData['spellright.' + key]) {
                    returnSettings[key] = userSettingsData['spellright.' + key];
                }
            });
        }
        if (SpellRight.CONFIGFILE.length == 0 && vscode.workspace.rootPath) {
            SpellRight.CONFIGFILE = path.join(vscode.workspace.rootPath, '.vscode', 'spellright.json');
        }
        if (SpellRight.CONFIGFILE.length > 0 && fs.existsSync(SpellRight.CONFIGFILE)) {

            var settings_1 = JSON.parse(jsonMinify(fs.readFileSync(SpellRight.CONFIGFILE, 'utf-8')));

            if (DEBUG_OUTPUT) {
                console.log('Configuration file: \"' + SpellRight.CONFIGFILE + '\".');
                console.log(settings_1);
            }

            Object.keys(returnSettings).forEach(function (key) {
                if (Array.isArray(returnSettings[key]))
                    returnSettings[key] = this.getUniqueArray(returnSettings[key].concat(settings_1[key]));
                else
                    returnSettings[key] = settings_1[key];
            }, this);
        }
        else {
            if (DEBUG_OUTPUT)
                console.log('Configuration file: \"' + SpellRight.CONFIGFILE + '\" not found.');
        }
        return returnSettings;
    };

    SpellRight.prototype.createUpdateSettings = function () {

        if (SpellRight.CONFIGFILE.length > 0 && !fs.existsSync(SpellRight.CONFIGFILE)) {
            if (DEBUG_OUTPUT)
                console.log('Creating configuration file: \"' + SpellRight.CONFIGFILE + '\".');
            this.saveWorkspaceSettings(settings);
        }
        else if (fs.existsSync(SpellRight.CONFIGFILE)) {
            if (DEBUG_OUTPUT)
                console.log('Overwriting configuration file: \"' + SpellRight.CONFIGFILE + '\".');
            this.saveWorkspaceSettings(settings);
        }
        else {
            if (DEBUG_OUTPUT)
                console.log('Invalid configuration file name: \"' + SpellRight.CONFIGFILE + '\".');
        }
    };

    SpellRight.suggestCommandId = 'spellright.fixSuggestionCodeAction';
    SpellRight.ignoreCommandId = 'spellright.ignoreWorkspaceCodeAction';
    SpellRight.alwaysIgnoreCommandId = 'spellright.ignoreGlobalCodeAction';

    SpellRight.CONFIGFILE = '';

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
    LanguageIndicator.prototype.updateLanguage = function () {
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

        var language = this.isLanguage(document);
        var message;
        var color;
        if (settings.documentTypes.indexOf(document.languageId) == (-1)) {
            message = '[off]';
            color = 'white';
        } else {
            message = langcode.code2Language(settings.language);
            if (DEBUG_OUTPUT) {
                message = message + ' [' + settings.language + ']';
            }
            color = 'white';
        }

        this.statusBarItem.text = '$(eye) ' + message;
        this.statusBarItem.color = color;
        this.statusBarItem.tooltip = 'Spell Checking Language & State';

        if (settings.statusBarIndicator) this.statusBarItem.show();
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
        this.LanguageIndicator.updateLanguage();
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
        this.LanguageIndicator.updateLanguage();
    };
    return LanguageIndicatorController;
}());

exports.LanguageIndicatorController = LanguageIndicatorController;
