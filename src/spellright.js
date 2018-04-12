// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017-2018 Bartosz Antosik. MIT License.
// -----------------------------------------------------------------------------

'use strict';

const vscode = require('vscode');

const path = require('path');
const glob = require('glob');
const fs = require('fs');
const mkdirp = require('mkdirp');
const jsonMinify = require('jsonminify');
const XRegExp = require('xregexp');
const ignore = require('ignore');
const os = require('os');
const osLocale = require('os-locale');
const opn = require("opn");

const bindings = require('../lib/bindings');

const langcode = require('../lib/langcode')
const doctype = require('../lib/doctype');
const parsers = require('../lib/parser');

var settings = {};
var dictionaries = [];

const CDICTIONARY = 'spellright.dict';

var helpers = {
    _cache: [],
    _uri: '',
    _currentDictionary: '',
    _currentPath: '',
    _UserDictionary: [],
    _WorkspaceDictionary: [],
    _ignoreFilesSettings: {},
    _ignoreFilesSpellignore: {},
    _commands: {
        signature: '',
        syntax: 0,
        ignore: false, // spellcheck-off or .spellignore
        force: false, // spellcheck-on
        languages: [],
        nlanguages: []
    }
};

var indicator = null;
var controller = null;

var _userDictionaryTransfer = [];
var _workspaceDictionaryTransfer = [];

var SpellRight = (function () {

    function SpellRight() {
        this.diagnosticMap = {};
        this.ignoreRegExpsMap = [];
        this.lastChanges = null;
        this.lastSyntax = 0;
        this.spellingContext = [];
        this.updateInterval = 1000;
        this.hunspell = false;
    }

    SpellRight.prototype.dispose = function () {
        this.suggestCommand.dispose();
        this.addToWorkspaceCommand.dispose();
        this.addToUserCommand.dispose();
        this.lastChanges.dispose();
    };

    SpellRight.prototype.activate = function (context) {

        var subscriptions = context.subscriptions;
        this.context = context;
        this.extensionRoot = context.extensionPath;

        // Force HUNSPELL - seems it does not work when setting the environment
        // variable from within VSCode. Works when it is set outside.
        // process.env['SPELLCHECKER_PREFER_HUNSPELL'] = 'true';

        // Detect HUNSPELL: Windows 7 & other that use Hunspell do not report
        // dictionaries available. Same if the environment variable
        // SPELLCHECKER_PREFER_HUNSPELL is set node-spellchecker will use
        // Hunspell instead of native service. It requires to list folder as
        // the list of available dictionaries.
        var _dictionaries = bindings.getAvailableDictionaries();
        this.hunspell = (_dictionaries.length === 0 || (typeof process.env.SPELLCHECKER_PREFER_HUNSPELL !== 'undefined'));

        this.getSettings();

        var _this = this;

        indicator = new SpellRightIndicator();
        controller = new SpellRightIndicatorController(indicator);

        // add to a list of disposables
        context.subscriptions.push(controller);
        context.subscriptions.push(indicator);

        vscode.commands.registerCommand('spellright.configurationUpdate', this.configurationUpdate, this);
        vscode.commands.registerCommand('spellright.selectDictionary', this.selectDictionary, this);
        vscode.commands.registerCommand('spellright.setCurrentTypeOFF', this.setCurrentTypeOFF, this);
        vscode.commands.registerCommand('spellright.addFromSelectionToWorkspaceDictionary', this.addFromSelectionToWorkspaceDictionary, this);
        vscode.commands.registerCommand('spellright.addFromSelectionToUserDictionary', this.addFromSelectionToUserDictionary, this);
        vscode.commands.registerCommand('spellright.openWorkspaceDictionary', this.openWorkspaceDictionary, this);
        vscode.commands.registerCommand('spellright.openUserDictionary', this.openUserDictionary, this);

        this.suggestCommand = vscode.commands.registerCommand(
            SpellRight.suggestCommandId, this.fixSuggestionCodeAction, this);
        this.addToWorkspaceCommand = vscode.commands.registerCommand(
            SpellRight.addToWorkspaceDictionaryCommandId, this.addToWorkspaceDictionaryCodeAction, this);
        this.addToUserCommand = vscode.commands.registerCommand(
            SpellRight.addToUserDictionaryCommandId, this.addToUserDictionaryCodeAction, this);
        subscriptions.push(this);

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
        vscode.workspace.onDidChangeConfiguration(this.doRefreshConfiguration, this, subscriptions);

        vscode.window.onDidChangeVisibleTextEditors(function (editors) {
            _this.SpellCheckAll();
        }, null);

        vscode.window.onDidChangeActiveTextEditor(function (editor) {
            if (vscode.window.activeTextEditor.document) {
                _this.doInitiateSpellCheck(vscode.window.activeTextEditor.document);
            }
        }, null);

        // register code actions provider for all languages
        vscode.languages.registerCodeActionsProvider('*', this);

        this.SpellCheckAll();
    };

    SpellRight.prototype.deactivate = function () {
        fs.unwatchFile(SpellRight.CONFIGFILE);
        fs.unwatchFile(pellRight.IGNOREFILE);
    }

    SpellRight.prototype.setCurrentTypeON = function () {
        var _document = vscode.window.activeTextEditor.document;
        var _documenttype = _document.languageId;

        var _i = settings.documentTypes.indexOf(_documenttype);
        if (_i == (-1)) {
            settings.documentTypes.push(_documenttype);
        }
        // Intentionally do not update configuration here because
        // setCurrentTypeON is only used when language is set
        // so configuration is updated later and only once.
    }

    SpellRight.prototype.setCurrentTypeOFF = function () {
        var _document = vscode.window.activeTextEditor.document;
        var _documenttype = _document.languageId;

        var _i = settings.documentTypes.indexOf(_documenttype);
        if (_i != (-1)) {
            settings.documentTypes.splice(_i, 1);
            this.diagnosticCollection.delete(_document.uri);
        }
        this.configurationUpdate(settings.configurationUpdate);
        indicator.updateStatusBarIndicator();

        if (SPELLRIGHT_DEBUG_OUTPUT) {
            console.log('[spellright] Turned OFF for \"' + _documenttype + '\"" document type.');
        }
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
//                vscode.window.showErrorMessage('SpellRight: The path to dictionaries \"' + this.getDictionariesPath() + '\" does not exist.')
            }
        } else {
            // Other dictionaries are ISO language/culture pairs
            _dictionaries = bindings.getAvailableDictionaries();
        }

        dictionaries = [];

        var _this = this;
        _dictionaries.forEach(function (entry) {

            if (SPELLRIGHT_DEBUG_OUTPUT) {
                console.log('[spellright] Adding dictionary [' + entry + '].');
            }

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
            var _code = langcode.language2Code(key);
            if (typeof _code !== 'undefined') {
                if (SPELLRIGHT_DEBUG_OUTPUT) {
                    var _description = languages[key];
                } else {
                    var _description = '';
                }

                dictionaries.push({
                    id: _code,
                    label: key,
                    description: _description
                });
            }
        }
    }

    SpellRight.prototype.selectDefaultLanguage = function () {

        // After default settings & reading settings the language is not set.
        // If it is OFF ('') then lets try to initialize it from system locales
        if (settings.language === '') {
            var _locale = osLocale.sync();
            var _locale_c = '';
            if (settings.groupDictionaries) {
                _locale_c = langcode.code2Language(_locale);
            } else {
                _locale_c = langcode.code2LanguageCulture(_locale);
            }

            var _this = this;

            dictionaries.forEach(function (entry) {
                if (entry.label == _locale_c) {
                    settings.language = entry.id;
                    return;
                }
            });
            if (SPELLRIGHT_DEBUG_OUTPUT) {
                console.log('[spellright] System locale: \"' + _locale + '\", set locale: \"' + settings.language + '\".');
            }
        }
    }

    SpellRight.prototype.configurationUpdate = function (persistent = true) {
        var _language = settings.language;
        var _documentTypes = settings.documentTypes;
        var _parserByClass = settings.parserByClass;

        if (SPELLRIGHT_DEBUG_OUTPUT) {
            console.log('[spellright] Update configuration: \"' + _language + '\", \"' + _documentTypes + '\".');
        }

        if (persistent && helpers._uri) {
            var _settings = vscode.workspace.getConfiguration('spellright', helpers._uri);
            var _scope = this.getSettingsScope(helpers._uri);

            _settings.update("language", _language, _scope);
            _settings.update("documentTypes", _documentTypes, _scope);
            if (Object.keys(_parserByClass).length !== 0)
                _settings.update("parserByClass", _parserByClass, _scope);
        } else {
            this.refreshSettings();
        }
    }

    SpellRight.prototype.selectDictionary = function() {

        var items = [];

        var _document = vscode.window.activeTextEditor.document;
        var _documenttype = _document.languageId;

        var _this = this;

        dictionaries.forEach(function (entry) {
            if (SPELLRIGHT_DEBUG_OUTPUT || (settings.groupDictionaries === false && _this.hunspell === false)) {
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

            if (!off && doctype.fromDocument(settings, _document) !== null) {
                settings.language = dict;
                _this.setDictionary(dict);
                _this.setCurrentTypeON();
                _this.configurationUpdate(settings.configurationUpdate);
            } else {
                if (doctype.fromDocument(settings, _document) === null) {

                    var items = [];

                    items.push({
                        label: 'Plain Text',
                        description: 'spells entire content of the document',
                        detail: ''
                    });
                    items.push({
                        label: 'Markdown',
                        description: 'spells everything except code blocks',
                        detail: ''
                    });
                    items.push({
                        label: 'Code',
                        description: 'spells comments and strings',
                        detail: ''
                    });
                    items.push({
                        label: 'LaTeX',
                        description: 'spells everything except LaTeX commands',
                        detail: ''
                    });
                    items.push({
                        label: 'XML',
                        description: 'spells comments and everything outside markup',
                        detail: ''
                    });

                    var options = {
                        placeHolder: 'Select generic parser for this document type [' + _document.languageId + ']'
                    };

                    vscode.window.showQuickPick(items, options).then(function (selection) {
                        if (typeof selection === 'undefined') {
                            return;
                        } else {
                            var _parser = '';
                            switch(selection.label) {
                                case 'Plain Text':
                                    _parser = 'plain';
                                    break;
                                case 'Markdown':
                                    _parser = 'markdown';
                                    break;
                                case 'Code':
                                    _parser = 'code';
                                    break;
                                case 'LaTeX':
                                    _parser = 'latex';
                                    break;
                                case 'XML':
                                    _parser = 'xml';
                                    break;
                            }

                            settings.parserByClass[_document.languageId] = {
                                "parser": _parser
                            }

                            _this.setCurrentTypeON();
                            _this.configurationUpdate(settings.configurationUpdate);
                        }
                    });
                } else {
                    _this.setCurrentTypeOFF();
                }
            }
        });
    };

    SpellRight.prototype.setDictionary = function (dictionary) {
        // Check if what we are trying to set is on the list of available
        // dictionaries. If not then set as [none], that is ''.
        var _dict = '';
        dictionaries.forEach(function (entry) {
            // Adjust for various LANGUAGE-COUNTRY separators ("_" or "-")
            var _dictionary = dictionary.replace(/_/g, '-');
            var _entry_id = entry.id.replace(/_/g, '-');
            if (_entry_id == _dictionary) {
                _dict = entry.id;
                return;
            }
        });

        if (_dict === '') {
            return;
        }

        if (this.hunspell) {
            var _path = this.getDictionariesPath();
        } else {
            var _path = '[none]';
        }

        if (helpers._currentDictionary === _dict && helpers._currentPath === _path)
            return;

        bindings.setDictionary(_dict, _path);

        if (SPELLRIGHT_DEBUG_OUTPUT) {
            console.log('[spellright] Dictionary (language) set to: \"' + _dict + '\" in \"' + _path + '\".');
        }
        helpers._currentDictionary = _dict;
        helpers._currentPath = _path
    };

    SpellRight.prototype.checkDictionary = function (dictionary) {
        var result = false;

        dictionaries.forEach(function (entry) {
            // Adjust for various LANGUAGE-COUNTRY separators ("_" or "-")
            var _dictionary = dictionary.replace(/_/g, '-');
            var _entry_id = entry.id.replace(/_/g, '-');
            if (_entry_id == _dictionary) {
                result = true;
            }
        });
        return result;
    }

    SpellRight.prototype.SpellCheckAll = function () {
        var _this = this;

        _this.doCancelSpellCheck();
        vscode.window.visibleTextEditors.forEach((editor, index, array) => {
            _this.doInitiateSpellCheck(vscode.window.activeTextEditor.document);
        });
    }

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

    SpellRight.prototype.splitByOtherWhite = function (word) {

        // Here split some special cases like: period (`terminal.integrated`),
        // digit (`good2know`), dash (`wp-admin`) etc. Other consequence should
        // be that these words are spelled both as split and as the whole.
        var rother = XRegExp('([^\.0-9\-\'\(\)]+)');
        var rsep = /[\.0-9\-\(\)]/;
        var parts = [];

        // We need a phantom split (e.g. for "2sth", "(sth)" case).
        if (rsep.test(word)) {
            parts.push({
                word: '',
                offset: 0
            });
        }

        XRegExp.forEach(word, rother, (match, i) => {
            parts.push({
                word: match[0],
                offset: match.index
            });
        });

        return parts;
    }

    SpellRight.prototype.prepareIgnoreRegExps = function (languageid) {

        this.ignoreRegExpsMap = [];

        for (var i = 0; i < settings.ignoreRegExps.length; i++) {
            try {
                // Convert the JSON of RegExp Strings into a real RegExp
                var flags = settings.ignoreRegExps[i].replace(/.*\/([gimy]*)$/, '$1');
                var pattern = settings.ignoreRegExps[i].replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
                pattern = pattern.replace(/\\\\/g, '\\');
                if (SPELLRIGHT_DEBUG_OUTPUT) {
                    console.log('[spellright] RegExp prepare: ' + settings.ignoreRegExps[i] + ' = /' + pattern + '/' + flags);
                }
                this.ignoreRegExpsMap.push(new RegExp(pattern, flags));
            }
            catch (e) {
                vscode.window.showErrorMessage('SpellRight: Ignore RexExp: \"' + settings.ignoreRegExps[i] + '\" malformed. Ignoring.');
                if (SPELLRIGHT_DEBUG_OUTPUT) {
                    console.log('[spellright] Ignore RegExp: \"' + settings.ignoreRegExps[i] + '\" malformed. Ignoring.');
                }
            }
        }

        if (settings.ignoreRegExpsByClass[languageid]) {
            for (var i = 0; i < settings.ignoreRegExpsByClass[languageid].length; i++) {
                try {
                    // Convert the JSON of RegExp Strings into a real RegExp
                    var flags = settings.ignoreRegExpsByClass[languageid][i].replace(/.*\/([gimy]*)$/, '$1');
                    var pattern = settings.ignoreRegExpsByClass[languageid][i].replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
                    pattern = pattern.replace(/\\\\/g, '\\');
                    if (SPELLRIGHT_DEBUG_OUTPUT) {
                        console.log('[spellright] RegExp prepare: by Class [' + languageid + ']: \"' + settings.ignoreRegExpsByClass[languageid][i] + ' = /' + pattern + '/' + flags);
                    }
                    this.ignoreRegExpsMap.push(new RegExp(pattern, flags));
                }
                catch (e) {
                    vscode.window.showErrorMessage('SpellRight: Ignore RexExp by Class [' + languageid + ']: \"' + settings.ignoreRegExpsByClass[languageid][i] + '\" malformed. Ignoring.');
                    if (SPELLRIGHT_DEBUG_OUTPUT) {
                        console.log('[spellright] Ignore RegExp: \"' + settings.ignoreRegExpsByClass[languageid][i] + '\" malformed. Ignoring.');
                    }
                }
            }
        }
    };

    SpellRight.prototype.testIgnoreRegExps = function (word) {
        for (var i = 0; i < this.ignoreRegExpsMap.length; i++) {
            if (word.match(this.ignoreRegExpsMap[i]) == word) {
                return true;
            }
        }
        return false;
    };

    SpellRight.prototype.testIgnoreFile = function (uri) {

        // No workspace folder in this context
        if (!vscode.workspace.getWorkspaceFolder(uri)) {
            return false;
        }

        var uriwpath = vscode.workspace.getWorkspaceFolder(uri);
        var urifspath = uriwpath.uri.fsPath;

        // Silently ignore files defined by spellright.ignoreFiles
        if (helpers._ignoreFilesSettings.ignores(path.relative(urifspath, uri.fsPath)) || helpers._ignoreFilesSpellignore.ignores(path.relative(urifspath, uri.fsPath))) {
            return true;
        }
        return false;
    }

    SpellRight.prototype.testWordInDictionaries = function (word) {
         for (var i = 0; i < helpers._UserDictionary.length; i++) {
             if (helpers._UserDictionary[i].toLowerCase() == word.toLowerCase())
                 return true;
         }
         for (var i = 0; i < helpers._WorkspaceDictionary.length; i++) {
             if (helpers._WorkspaceDictionary[i].toLowerCase() == word.toLowerCase())
                 return true;
         }
         return false;
    };

    SpellRight.prototype.getEffectiveLanguage = function () {
        // The hierarchy should be from topmost to lowest: In-Document Command,
        // Context, Default language chosen for spelling of the current word.

        if (this.spellingContext[0]._languageCommand) {
            return this.spellingContext[0]._languageCommand;
        } else if (this.spellingContext[0]._languageContext) {
            return this.spellingContext[0]._languageContext;
        } else {
            return this.spellingContext[0]._languageDefault;
        }
    };

    SpellRight.prototype.checkAndMark = function (document, context, diagnostics, word, exword, linenumber, colnumber) {

        var _linenumber = linenumber;
        var _colnumber = colnumber;

        if (SPELLRIGHT_DEBUG_OUTPUT && false) {
            console.log('[spellright] Spell [' + context +  ']: \"' + word + '\"');
        }

        // Check if current context not disabled by syntatic control
        if (settings.spellContextByClass[document.languageId]) {
            if (settings.spellContextByClass[document.languageId].indexOf(context) == (-1)) {
                return;
            }
        } else if (settings.spellContext.indexOf(context) == (-1)) {
            return;
        }

        // Set language for the current syntactical context
        if (settings.languageContextByClass[document.languageId]) {
            this.spellingContext[0]._languageContext = settings.languageContextByClass[document.languageId][context];
        } else if (settings.languageContext[context]) {
            this.spellingContext[0]._languageContext = settings.languageContext[context];
        } else {
            this.spellingContext[0]._languageContext = undefined;
        }

        // Words are selected by language specific parsers but from here on
        // they are treated in the same way so these are operations done on
        // every word/lexem spelled.

        cword = word;

        // Special case of words ending with period - abbreviations, etc.
        // Also cleanup for situations like: "peoples'." or LaTeX ""``up''".
        var _endsWithPeriod = cword.endsWith('.');
        var _endsWithApostrophe = cword.endsWith('\'');
        while (cword.endsWith('.') || cword.endsWith('\'')) {
            _endsWithPeriod = cword.endsWith('.');
            _endsWithApostrophe = cword.endsWith('\'');

            var cword = cword.slice(0, -1);
        }

        while (cword.startsWith('.') || cword.startsWith('\'')) {
            var cword = cword.slice(1);
            _colnumber++;
        }
        var _containsPeriod = /[\.]/.test(cword);
        var _containsApostrophe = /[\'']/.test(cword);
        var _containsDash = /[-]/.test(cword);
        var _containsDigitInside = /\D\d\D/.test(cword);
        var _containsEmoji = /[\ue000-\uf8ff]|\ud83c[\udf00-\udfff]|\ud83d[\udc00-\uddff]/.test(cword);
        var _parentheticalPlural = /^\w+\((\w{1,2})\)$/.test(cword);
        var _containsParenthesis = /[\(\)]/.test(cword);

        // Emojis crash Hunspell both on Linux and Windows
        if (_containsEmoji && this.hunspell) {
            return;
        }

        if (_parentheticalPlural) {
            // Here spell special case of parenthical plural (one or two
            // characters in parenthesis directly glued to the word, like
            // word(s), process(es) etc.)
            var ppmatch = /^(\w+)\((\w{1,2})\)$/;
            var match = ppmatch.exec(cword);
            cword = match[1];
        }

        this.setDictionary(this.getEffectiveLanguage());

        // Before splitting make sure word is not spelled correctly or on the
        // ignore list or regular expressions to ignore as a whole.
        if (!bindings.isMisspelled(cword) || this.testWordInDictionaries(cword)) {

            // Here word is spelled correctly or on the ignore list but there
            // are some special cases, like flaws in spelling engines.

            var _digitInsideOnWindows = false;

            // Some special cases are held here

            // Somehow Windows Spelling API considers anything with digit
            // inside a correctly spelled entity. Has to be corrected.
            if (_containsDigitInside && !this.hunspell && process.platform == 'win32') {
                _digitInsideOnWindows = true;
            }

            // Do not exit if one of special cases
            if (!_digitInsideOnWindows) {
                return;
            } else if (this.testWordInDictionaries(cword)) {
                return;
            }
        }

        // Split words containing period inside. Period does not break words
        // because it is part of legit abbreviations (e.g., i.e., etc.) which
        // should be spelled as well. So there can be lexems containing periods
        // inside. But they should be later on spelled as parts to minimize
        // the number of false positives.
        var _split = this.splitByOtherWhite(cword);
        if (_split.length > 1) {
            var _this = this;
            _split.forEach (function(e) {
                if (e.word.length >= 2) {
                    _this.checkAndMark(document, context, diagnostics, e.word, cword, _linenumber, _colnumber + e.offset);
                }
            });
            return;
        }

        // Deal with CamelCase
        _split = this.splitCamelCase(cword);
        if (_split.length > 1) {
            var _this = this;
            _split.forEach(function (e) {
                if (e.word.length >= 2) {
                    _this.checkAndMark(document, context, diagnostics, e.word, cword, _linenumber, _colnumber + e.offset);
                }
            });
            return;
        }

        // Deal with snake_case
        _split = this.splitSnakeCase(cword);
        if (_split.length > 1) {
            var _this = this;
            _split.forEach(function (e) {
                if (e.word.length >= 2) {
                    _this.checkAndMark(document, context, diagnostics, e.word, cword, _linenumber, _colnumber + e.offset);
                }
            });
            return;
        }

        // Punctuation cleaned version of the word

        // Special case of words ending with period  - if spelling
        // with dot at the end is correct contrary to spelling
        // without the dot then pass over.
        if (_endsWithPeriod) {
            if (!bindings.isMisspelled(cword + '.')) {
                return;
            }
        }

        // Same case if it ends with apostrophe
        if (_endsWithApostrophe) {
            if (!bindings.isMisspelled(cword + '\'')) {
                return;
            }
        }

        if (_containsDash) {
            return;
        }

        var range = new vscode.Range(_linenumber, _colnumber, _linenumber, _colnumber + cword.length);

        var message = '\"' + cword + '\"';
        if (SPELLRIGHT_DEBUG_OUTPUT) {
            message += ' (' + context + ')';
        }
        if (settings.suggestionsInHints) {
            var suggestions = bindings.getCorrectionsForMisspelling(word);
            if (suggestions.length > 0) {
                message += ': suggestions';
                if (helpers._commands.languages.length > 1 || helpers._commands.nlanguages.length > 0) {
                    message += ' [' + this.getEffectiveLanguage() + ']: ';
                } else {
                    message += ': ';
                }
                for (var _i = 0, suggestions_1 = suggestions; _i < suggestions_1.length; _i++) {
                    var s = suggestions_1[_i];
                    message += s + ', ';
                }
                message = message.slice(0, message.length - 2);
            } else {
                message += ': no suggestions';
            }
        }

        var diagnosticsType = vscode.DiagnosticSeverity.Error;

        if (settings.notificationClass === 'warning') {
            diagnosticsType = vscode.DiagnosticSeverity.Warning;
        } else if (settings.notificationClass === 'information') {
            diagnosticsType = vscode.DiagnosticSeverity.Information;
        } else if (settings.notificationClass === 'hint') {
            diagnosticsType = vscode.DiagnosticSeverity.Hint;
        }

        var diag = new vscode.Diagnostic(range, message, diagnosticsType);
        diag.source = 'spelling';

        // Extend with context for actions provided in suggestions menu
        diag['word'] = word;
        diag['exword'] = exword;
        diag['language'] = this.getEffectiveLanguage();
        diag['context'] = context;
        diag['range'] = range;

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
                // if (_linenumber < _drange._end._line ||
                //     (_linenumber <= _drange._end._line &&
                //     _colnumber <= _drange._end._character)) {
                if (_drange._end.isBeforeOrEqual(diag.range.start))
                    continue;
                diagnostics.splice(i, 0, diag);
                break;
            }
        }
    }

    SpellRight.prototype.interpretCommand = function (command, parameters, range) {
        if (this.spellingContext.length > 0) {
            if (command === 'on') {
                this.spellingContext[0]._enabled = true;
            } else if (command === 'off') {
                this.spellingContext[0]._enabled = false;
            } else if (command === 'language') {
                if (this.checkDictionary(parameters)) {
                    this.spellingContext[0]._languageCommand = parameters;
                } else {
                    this.spellingContext[0]._languageCommand = undefined;
                }
            }
        }
    }

    // Remove diagnostics in lines that were touched by change and in case
    // change brings any shift up/down - shift diagnostics.
    SpellRight.prototype.adjustDiagnostics = function (diagnostics, range, shift) {

        for (var i = diagnostics.length - 1; i >= 0; i--) {
            var _drange = diagnostics[i].range;
            if (_drange._start._line >= range._start._line &&
                _drange._end._line <= range._end._line) {
                // Remove diagnostics for changed lines range
                diagnostics.splice(i, 1);
            } else {
                // Adjust diagnostics behind changed lines range BEFORE
                if (shift != 0) {
                    if (_drange._end._line > range._end._line) {
                        _drange._start._line += shift;
                        _drange._end._line += shift;
                    }
                }
            }
        }
    }

    SpellRight.prototype.doRefreshConfiguration = function (event) {

        // Invalidate settings cache
        helpers._cache = [];

        this.refreshSettings();
    }

    SpellRight.prototype.doDiffSpellCheck = function (event) {

        helpers._commands.ignore = false;
        helpers._commands.force = false;
        helpers._commands.languages = [settings.language];
        helpers._commands.nlanguages = [];

        this.getSettings(event.document);

        // Is off for this document type?
        if (settings.documentTypes.indexOf(event.document.languageId) == (-1)) {
            indicator.updateStatusBarIndicator();
            this.diagnosticCollection.delete(event.document.uri);
            this.diagnosticMap[event.document.uri.toString()] = undefined;
            return;
        }

        // Is language set to "none"?
        if (settings.language == '') {
            return;
        }

        var document = event.document;
        var parser = doctype.fromDocument(settings, document);

        if (parser == null) {
            return
        };

        var _this = this;

        var _return = { syntax: 0, linecount: 0 };
        var _signature = '';
        var _local_context = false;

        _return = parser.parseForCommands(document, { ignoreRegExpsMap: this.ignoreRegExpsMap, latexSpellParameters: settings.latexSpellParameters }, function (command, parameters, range) {

            _signature = _signature + command + '-' + parameters;

            if (SPELLRIGHT_DEBUG_OUTPUT) {
                console.log('[spellright] In-Document Command: ' + command + ' [' + parameters + ']');
            }
            if (command === 'off') {
                helpers._commands.ignore = true;
            }
            if (command === 'on') {
                helpers._commands.force = true;
            }
            if (command === 'language' && typeof parameters !== 'undefined' && parameters !== '') {
                if (_this.checkDictionary(parameters)) {
                    helpers._commands.languages.pushIfNotExist(parameters, function (e) {
                        return e === parameters;
                    });
                } else {
                    helpers._commands.nlanguages.pushIfNotExist(parameters, function (e) {
                        return e === parameters;
                    });
                }
            }
        });

        // .spellignore tested here so it can be overriden by InDoc command(s)
        if (this.testIgnoreFile(document.uri)) {
            helpers._commands.ignore = true;
        }

        indicator.updateStatusBarIndicator();

        // Ignore spelling forced
        if (helpers._commands.ignore && !helpers._commands.force) {
            if (typeof this.diagnosticMap[document.uri.toString()] !== 'undefined') {
                this.doCancelSpellCheck();
                this.diagnosticCollection.delete(document.uri);
                this.diagnosticMap[document.uri.toString()] = undefined;
            }
            return;
        }

        if (typeof this.diagnosticMap[document.uri.toString()] === 'undefined') {
            this.doInitiateSpellCheck(document);
            return;
        }

        // If the document is being spelled (e.g. is large) adjust diagnostics
        // that are being prepared in the background, not those from the store.
        var diagnostics = [];

        if (this.spellingContext.length == 0) {
            diagnostics = this.diagnosticMap[document.uri.toString()];

            // Create temporary context
            var _context = {
                _document: document,
                _parser: parser,
                _diagnostics: diagnostics,
                _line: 0,
                _start: Date.now(),
                _update: Date.now(),
                _languageDefault: settings.language,
                _languageContext: undefined,
                _languageCommand: undefined,
                _enabled: true
            };
            this.spellingContext.push(_context);
            _local_context = true;
        } else {
            diagnostics = this.spellingContext[0]._diagnostics;
        }

        // Calculate whether changes have shifted document lines up/down
        var shift = 0;

        for (var i = 0, l = event.contentChanges.length; i < l; i++) {
            var range = event.contentChanges[i].range;
            var _nlines = event.contentChanges[i].text.split(/\r?\n/).length - 1;
            shift = _nlines - (range.end.line - range.start.line);
        }

        // Main incremental spell check loop: check change affected
        for (var i = 0, l = event.contentChanges.length; i < l; i++) {
            var range = event.contentChanges[i].range;

            this.adjustDiagnostics(diagnostics, range, shift);

            parser.spellCheckRange(document, diagnostics, { ignoreRegExpsMap: this.ignoreRegExpsMap, latexSpellParameters: settings.latexSpellParameters }, (document, context, diagnostics, word, exword, linenumber, colnumber) => this.checkAndMark(document, context, diagnostics, word, exword, linenumber, colnumber), (command, parameters) => this.interpretCommand(command, parameters), range.start.line, range.end.character, range.end.line + shift, range.end.character);
        }

        // Spell check trail left after changes/jumps
        if (this.lastChanges !== null) {

            for (var i = 0, l = this.lastChanges.length; i < l; i++) {
                var range = this.lastChanges[i].range;

                for (var j = 0, k = event.contentChanges.length; j < k; j++) {
                    var erange = event.contentChanges[j].range;
                    // Exclude actually modified line from trail
                    if (!(erange.start.line >= range.start.line &&
                        erange.end.line <= range.start.line)) {

                        if (range.start.line <= erange.start.line ||
                            range.end.line <= erange.end.line) {
                            shift = 0;
                        }

                        var _range = new vscode.Range(range.start.line + shift, range.start.character, range.end.line + shift, range.end.character);
                        this.adjustDiagnostics(diagnostics, _range, 0);

                        parser.spellCheckRange(document, diagnostics, { ignoreRegExpsMap: this.ignoreRegExpsMap, latexSpellParameters: settings.latexSpellParameters }, (document, context, diagnostics, word, exword, linenumber, colnumber) => this.checkAndMark(document, context, diagnostics, word, exword, linenumber, colnumber), (command, parameters) => this.interpretCommand(command, parameters), range.start.line + shift, void 0, range.end.line + shift, void 0);
                    }
                }
            }
            this.lastChanges = null;
        }
        // Save it for next pass change/jump detection
        this.lastChanges = event.contentChanges;

        if (_local_context)
            this.spellingContext.shift();

        this.diagnosticCollection.set(document.uri, diagnostics);

        if (helpers._commands.syntax != _return.syntax ||
            helpers._commands.signature !== _signature) {
            this.doCancelSpellCheck();
            helpers._commands.syntax = _return.syntax;
            helpers._commands.signature = _signature;
            this.doInitiateSpellCheck(document);
        }
    };

    SpellRight.prototype.doInitiateSpellCheck = function (document) {

        helpers._commands.syntax = 0;
        helpers._commands.signature = '';
        helpers._commands.ignore = false;
        helpers._commands.force = false;
        helpers._commands.languages = [settings.language];
        helpers._commands.nlanguages = [];

        this.getSettings(document);

        // Is off for this document type?
        if (settings.documentTypes.indexOf(document.languageId) == (-1)) {
            indicator.updateStatusBarIndicator();
            this.diagnosticCollection.delete(document.uri);
            this.diagnosticMap[document.uri.toString()] = undefined;
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
        const parser = doctype.fromDocument(settings, document);

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
            _languageDefault: settings.language,
            _languageContext: undefined,
            _languageCommand: undefined,
            _enabled: true
        };

        var _return = { syntax: 0, linecount: 0 };
        var _signature = '';

        var _this = this;
        var _length = this.spellingContext.length;

        _return = parser.parseForCommands(document, { ignoreRegExpsMap: this.ignoreRegExpsMap,
            latexSpellParameters: settings.latexSpellParameters }, function (command, parameters, range) {

            _signature = _signature + command + '-' + parameters;

            if (SPELLRIGHT_DEBUG_OUTPUT) {
                console.log('[spellright] In-Document Command: ' + command + ' [' + parameters + ']');
            }
            if (command === 'off') {
                helpers._commands.ignore = true;
            }
            if (command === 'on') {
                helpers._commands.force = true;
            }
            if (command === 'language' && typeof parameters !== 'undefined' && parameters !== '') {
                if (_this.checkDictionary(parameters)) {
                    helpers._commands.languages.pushIfNotExist(parameters, function (e) {
                        return e === parameters;
                    });
                } else {
                    helpers._commands.nlanguages.pushIfNotExist(parameters, function (e) {
                        return e === parameters;
                    });
                }
            }
        });

        helpers._commands.syntax = _return.syntax;
        helpers._commands.signature = _signature;

        // .spellignore tested here so it can be overriden by InDoc command(s)
        if (this.testIgnoreFile(document.uri)) {
            helpers._commands.ignore = true;
        }

        indicator.updateStatusBarIndicator();

        // Ignore spelling forced
        if (helpers._commands.ignore && !helpers._commands.force) {
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
                console.log('[spellright] Spelling of \"' + document.fileName + '\" [' + document.languageId + '] STARTED.');
            }
        }
    }

    SpellRight.prototype.doStepSpellCheck = function (_this) {

        var _return = { syntax: 0, linecount: 0 };

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

            _return = parser.spellCheckRange(document, diagnostics, { ignoreRegExpsMap: this.ignoreRegExpsMap, latexSpellParameters: settings.latexSpellParameters }, (document, context, diagnostics, word, exword, linenumber, colnumber) => _this.checkAndMark(document, context, diagnostics, word, exword, linenumber, colnumber), (command, parameters) => this.interpretCommand(command, parameters), line, void 0, line + (SPELLRIGHT_LINES_BATCH - 1), void 0);

            // Update interface with already collected diagnostics
            if (this.updateInterval > 0) {
                if (Date.now() - update > this.updateInterval) {
                    _this.diagnosticCollection.set(document.uri, diagnostics);
                    _this.diagnosticMap[document.uri.toString()] = diagnostics;

                    _this.spellingContext[0]._update = Date.now();
                }
            }

            // Push spelling a few lines forward
            _this.spellingContext[0]._line += SPELLRIGHT_LINES_BATCH;

        } else {
            _this.diagnosticCollection.set(document.uri, diagnostics);
            _this.diagnosticMap[document.uri.toString()] = diagnostics;

            if (SPELLRIGHT_DEBUG_OUTPUT) {
                var secs = (Date.now() - start) / 1000;

                console.log('[spellright] Spelling of \"' + document.fileName + '\" [' + document.languageId + '] COMPLETED in ' + String(secs) + 's, ' + diagnostics.length + ' errors.');
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
                    console.log('[spellright] Spelling of \"' + context._document.fileName + '\" [' + context._document.languageId + '] CANCELLED.');
                }

                _this.spellingContext.shift();
            });
        }
    };

    SpellRight.prototype.provideCodeActions = function (document, range, context, token) {

        var diagnostic = undefined;

        context.diagnostics.forEach(function (_diagnostics) {
            if (_diagnostics.source == 'spelling' && _diagnostics.range._start._character >= range._start._character && _diagnostics.range._end._character <= range._end._character) {
                diagnostic = _diagnostics;
            }
        });

        if (!diagnostic) return null;

        if (settings.documentTypes.indexOf(document.languageId) == (-1) || (helpers._commands.ignore && !helpers._commands.force) || settings.language == '') {
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

        if (SPELLRIGHT_DEBUG_OUTPUT) {
            console.log('[spellright] Providing code action for \"' + word + '\".');
        }

        var language = settings.language;

        // Parse to identify language which should be used for suggestions
        var parser = doctype.fromDocument(settings, document);
        var _this = this;

        if (parser) {
            parser.parseForCommands(document, { ignoreRegExpsMap: this.ignoreRegExpsMap, latexSpellParameters: settings.latexSpellParameters }, function (command, parameters, crange) {
                if (crange._start._line <= range._start._line) {
                    if (command === 'language') {
                        if (_this.checkDictionary(parameters)) {
                            language = parameters;
                        } else {
                            language = settings.language;
                        }
                    }
                }
            });
        };

        // Get suggestions
        this.setDictionary(diagnostic['language']);

        var commands = [];
        if (word && word.length >= 1) {
            var suggestions = bindings.getCorrectionsForMisspelling(word);

            // Add suggestions to command list
            suggestions.forEach(function (suggestion) {
                commands.push({
                    title: suggestion,
                    command: SpellRight.suggestCommandId,
                    arguments: [document, diagnostic, word, suggestion]
                });
            });
            if (vscode.workspace.getWorkspaceFolder(helpers._uri)) {
                commands.push({
                    title: 'Add \"' + cword + '\" to workspace dictionary',
                    command: SpellRight.addToWorkspaceDictionaryCommandId,
                    arguments: [document, cword]
                });
            }
            if (diagnostic['word'] != diagnostic['exword']) {
                // Here propose to add compound word to the dictionary when
                // only a part of it spells incorectly
                if (vscode.workspace.getWorkspaceFolder(helpers._uri)) {
                    commands.push({
                        title: 'Add \"' + diagnostic['exword'] + '\" to workspace dictionary',
                        command: SpellRight.addToWorkspaceDictionaryCommandId,
                        arguments: [document, diagnostic['exword']]
                    });
                }
            }
            commands.push({
                title: 'Add \"' + cword + '\" to user dictionary',
                command: SpellRight.addToUserDictionaryCommandId,
                arguments: [document, cword]
            });
            if (diagnostic['word'] != diagnostic['exword']) {
                // Here propose to add compound word to the dictionary when
                // only a part of it spells incorectly
                commands.push({
                    title: 'Add \"' + diagnostic['exword'] + '\" to user dictionary',
                    command: SpellRight.addToUserDictionaryCommandId,
                    arguments: [document, diagnostic['exword']]
                });
            }
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
            vscode.window.showErrorMessage('SpellRight: The suggestion was not applied because it is outdated.');
        }
    };

    SpellRight.prototype.addToWorkspaceDictionaryCodeAction = function (document, word) {
        if (!this.addWordToWorkspaceDictionary(word, true)) {
            vscode.window.showWarningMessage('SpellRight: The word \"' + word + '\" has already been added to workspace dictionary.');
        } else {
            this.refreshSettings();
        }
    };

    SpellRight.prototype.addFromSelectionToWorkspaceDictionary = function () {
        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }

        var selection = editor.selection;
        if (selection.isSingleLine) {
            var text = editor.document.getText(selection);
            if (!/\s/g.test(text)) {
                if (this.addWordToWorkspaceDictionary(text, true)) {
                    this.doInitiateSpellCheck(editor.document);
                }
            } else {
                vscode.window.showInformationMessage('SpellRight: Cannot add text with whitespaces to dictionary.');
            }
        } else {
            vscode.window.showInformationMessage('SpellRight: Cannot add multiline text to dictionary.');
        }
    }

    SpellRight.prototype.addToUserDictionaryCodeAction = function (document, word) {
        if (!this.addWordToUserDictionary(word)) {
            vscode.window.showWarningMessage('SpellRight: The word \"' + word + '\" has already been added to user dictionary.');
        } else {
            this.refreshSettings();
        }
    };

    SpellRight.prototype.addFromSelectionToUserDictionary = function () {
        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }

        var selection = editor.selection;
        if (selection.isSingleLine) {
            var text = editor.document.getText(selection);
            if (!/\s/g.test(text)) {
                if (this.addWordToUserDictionary(text)) {
                    this.doInitiateSpellCheck(editor.document);
                }
            } else {
                vscode.window.showInformationMessage('SpellRight: Cannot add text with whitespaces to dictionary.');
            }
        } else {
            vscode.window.showInformationMessage('SpellRight: Cannot add multiline text to dictionary.');
        }
    }

    SpellRight.prototype.openWorkspaceDictionary = function () {
        var fileName = this.getWorkspaceDictionaryFilename();
        if (fs.existsSync(fileName)) {
            var openPath = vscode.Uri.file(fileName);
            vscode.workspace.openTextDocument(openPath).then(doc => {
                vscode.window.showTextDocument(doc);
                });
        } else {
            vscode.window.showInformationMessage('SpellRight: Workspace dictionary file does not exist. It will be created when first word is added.');
        }
    }

    SpellRight.prototype.openUserDictionary = function () {
        var fileName = this.getUserDictionaryFilename();
        if (fs.existsSync(fileName)) {
            var openPath = vscode.Uri.file(fileName);
            vscode.workspace.openTextDocument(openPath).then(doc => {
                vscode.window.showTextDocument(doc);
            });
        } else {
            vscode.window.showInformationMessage('SpellRight: User dictionary file does not exist. It will be created when first word is added.');
        }
    }

    SpellRight.prototype.addWordToDictionary = function (word, filename) {
        if (!fs.existsSync(filename)) {
            fs.closeSync(fs.openSync(filename, 'w'));
        }

        fs.appendFileSync(filename, word + os.EOL);
    }

    SpellRight.prototype.addWordToWorkspaceDictionary = function (word, save) {
        // Only add if it's not already in the list
        if (helpers._WorkspaceDictionary.indexOf(word) < 0) {
            helpers._WorkspaceDictionary.push(word);
            if (save) {
                this.addWordToDictionary(word, this.getWorkspaceDictionaryFilename());
            }
            return true;
        }
        return false;
    };

    SpellRight.prototype.addWordToUserDictionary = function (word) {
        // Only add if it's not already in the list
        if (helpers._UserDictionary.indexOf(word) < 0) {
            helpers._UserDictionary.push(word);
            if (settings.addToSystemDictionary) {
                bindings.add(word);
            } else {
                this.addWordToDictionary(word, this.getUserDictionaryFilename());
            }
            return true;
        }
        return false;
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

    SpellRight.prototype.getSettingsScope = function (uri) {
        var editor = vscode.window.activeTextEditor;
        if (editor) {
            if (vscode.workspace.getWorkspaceFolder(editor.document.uri)) {
                if (settings.configurationScope == "user") {
                    return vscode.ConfigurationTarget.Global;
                } else {
                    return vscode.ConfigurationTarget.WorkspaceFolder;
                }
            } else {
                if (vscode.workspace.workspaceFolders) {
                    // Out of workspace document opened IN WORKSPACE
                    return vscode.ConfigurationTarget.Workspace;
                } else {
                    // Out of workspace document opened STANDALONE
                    return vscode.ConfigurationTarget.Global;
                }
            }
        } else {
            return vscode.ConfigurationTarget.Global;
        }
    };

    SpellRight.prototype.getDictionariesPath = function () {


        var codeFolder = 'Code';
        if (vscode.version.indexOf('insider') >= 0) codeFolder = 'Code - Insiders';

        if (process.platform == 'win32') {
            // Regular version, workspace opened
            var sourcePath = path.join(process.env.APPDATA, codeFolder);
            if (this.context.storagePath == undefined) {
                // Regular version, workspace NOT opened
                if (!fs.existsSync(sourcePath)) {
                    // Portable version
                    sourcePath = path.join(vscode.env.appRoot, '..', '..', '..', '..', 'Data', 'code');
                }
            }
        } else if (process.platform == 'darwin') {
            var sourcePath = path.join(process.env.HOME, 'Library', 'Application Support', codeFolder);
        } else if (process.platform == 'linux') {
            var sourcePath = path.join(process.env.HOME, '.config', codeFolder);
        }
        var userRoot = path.normalize(sourcePath);

        var dictionaryPath;
        if (process.platform == 'win32')
            dictionaryPath = path.join(userRoot, 'Dictionaries');
        else if (process.platform == 'darwin')
            dictionaryPath = path.join(userRoot, 'Dictionaries');
        else if (process.platform == 'linux')
            dictionaryPath = path.join(userRoot, 'Dictionaries');
        else
            dictionaryPath = '';

        if (SPELLRIGHT_DEBUG_OUTPUT) {
            console.log('[spellright] Dictionaries path: \"' + dictionaryPath + '\"');
        }
        return dictionaryPath;
    };

    SpellRight.prototype.getWorkspaceDictionaryPath = function () {
        var editor = vscode.window.activeTextEditor;
        if (editor) {
            if (vscode.workspace.getWorkspaceFolder(editor.document.uri)) {
                var wpath = path.join(vscode.workspace.getWorkspaceFolder(editor.document.uri).uri.fsPath, '.vscode');
                if (!fs.existsSync(wpath)) {
                    try {
                        fs.mkdirSync(wpath);
                    } catch (err) {
                        return null;
                    }
                }
                return wpath;
            } else {
                return null;
            }
        } else {
            return null;
        }
    };

    SpellRight.prototype.getWorkspaceDictionaryFilename = function () {
        if (this.getWorkspaceDictionaryPath()) {
            return path.join(this.getWorkspaceDictionaryPath(), CDICTIONARY);
        } else {
            return '';
        }
    };

    SpellRight.prototype.getUserDictionaryFilename = function () {
        var codeFolder = 'Code';
        if (vscode.version.indexOf('insider') >= 0)
            codeFolder = 'Code - Insiders';
        if (process.platform == 'win32')
            return path.join(process.env.APPDATA, codeFolder, 'User', CDICTIONARY);
        else if (process.platform == 'darwin')
            return path.join(process.env.HOME, 'Library', 'Application Support', codeFolder, 'User', CDICTIONARY);
        else if (process.platform == 'linux')
            return path.join(process.env.HOME, '.config', codeFolder, 'User', CDICTIONARY);
        else
            return '';

    };

    SpellRight.prototype.readDictionaryFile = function (fileName) {
        if (fileName.length > 0) {
            if (fs.existsSync(fileName)) {
                var result = [];
                try {
                    result = require('fs').readFileSync(fileName, 'utf-8')
                        .split(os.EOL)
                        .filter(Boolean);

                    if (SPELLRIGHT_DEBUG_OUTPUT) {
                        console.log('[spellright] Read ' + result.length + ' word(s) from \"' + fileName + '\" dictionary file.');
                    }

                    return result;
                } catch (e) {
                }
            }
        }
        return [];
    };

    SpellRight.prototype.readDictionaryFiles = function (pathName) {
        const dictionaryFiles = glob(path.join(pathName, '.vscode', '*.dict', ''), { sync: true });
        var result = [];

        dictionaryFiles.forEach((file) => {
            try {
                result = result.concat(this.readDictionaryFile(file));
            } catch (e) {
            }
        });
        return result;
    }

    SpellRight.prototype.readIgnoreFile = function (ipath) {
        var ifile = path.join(ipath, '.spellignore');
        var result = ignore();
        var count = 0;

        if (fs.existsSync(ifile)) {
            result.add(fs.readFileSync(ifile, 'utf-8'));
            count++;
        }

        if (SPELLRIGHT_DEBUG_OUTPUT) {
            console.log('[spellright] Read ' + count + ' pattern(s) from \"' + ifile + '\" file.');
        }
        return result;
    }

    SpellRight.prototype.getSettings = function (document = undefined) {
        var uri = undefined;
        var languageid = undefined;
        var uriwpath = undefined;
        var urifspath = '';

        if (document !== undefined) {
            uri = document.uri;
            languageid = document.languageId;
            uriwpath = vscode.workspace.getWorkspaceFolder(uri);
            if (uriwpath !== undefined)
                urifspath = uriwpath.uri.fsPath;
        }

        if (!helpers._cache[urifspath]) {
            var _settings = vscode.workspace.getConfiguration('spellright', uri);

            // Shadow settings
            for (var p in _settings) settings[p] = _settings[p];

            if (SPELLRIGHT_DEBUG_OUTPUT) {
                console.log('[spellright] Get LIVE settings for \"' + urifspath + '\".');
            }

            helpers._cache[urifspath] = Object.assign({}, settings);
        } else  {
            // Update settings
            if (helpers._uri) {
                var _uriwpath = vscode.workspace.getWorkspaceFolder(helpers._uri);
                if (_uriwpath !== undefined) {
                    var _urifspath = _uriwpath.uri.fsPath;
                    if (_urifspath != urifspath && helpers._cache[_urifspath]) {
                        helpers._cache[_urifspath] = Object.assign({}, settings);
                    }
                }
            }
            settings = Object.assign({}, helpers._cache[urifspath]);

            if (SPELLRIGHT_DEBUG_OUTPUT) {
                console.log('[spellright] Get CACHED settings for \"' + urifspath + '\".');
            }
        }
        helpers._uri = uri;

        this.collectDictionaries();
        this.selectDefaultLanguage();

        this.prepareIgnoreRegExps(languageid);

        helpers._ignoreFilesSettings = ignore();
        settings.ignoreFiles.forEach(function (key) {
            helpers._ignoreFilesSettings.add(key);
        });

        helpers._UserDictionary = this.readDictionaryFile(this.getUserDictionaryFilename());

        // Here loading workspace "per resource" dictionaries
        if (uri && vscode.workspace.getWorkspaceFolder(uri)) {
            helpers._WorkspaceDictionary = this.readDictionaryFiles(urifspath);
            helpers._ignoreFilesSpellignore = this.readIgnoreFile(urifspath);
        }

        return;
    };

    SpellRight.prototype.refreshSettings = function (event) {

        this.getSettings();
        indicator.updateStatusBarIndicator();
        this.SpellCheckAll();
    }

    SpellRight.suggestCommandId = 'spellright.fixSuggestionCodeAction';
    SpellRight.addToWorkspaceDictionaryCommandId = 'spellright.addToWorkspaceDictionaryCodeAction';
    SpellRight.addToUserDictionaryCommandId = 'spellright.addToUserDictionaryCodeAction';

    SpellRight.CONFIGFILE = '';
    SpellRight.IGNOREFILE = '';

    return SpellRight;
}());

Object.defineProperty(exports, '__esModule', { value: true });
exports.default = SpellRight;

var SpellRightIndicator = (function () {
    function SpellRightIndicator() {
    }
    SpellRightIndicator.prototype.dispose = function () {
        this.hideLanguage();
    };
    SpellRightIndicator.prototype.updateStatusBarIndicator = function () {
        var location = vscode.StatusBarAlignment.Right;
        var priority = SPELLRIGHT_STATUSBAR_ITEM_PRIORITY;

        if (!this.statusBarItem) {
            this.statusBarItem = vscode.window.createStatusBarItem(location, priority);
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
        var tooltip = 'Spell Checking - ';

        dictionaries.forEach(function (entry) {
            // Adjust for various LANGUAGE-COUNTRY separators ("_" or "-")
            var _dictionary = settings.language.replace(/_/g, '-');
            var _entry_id = entry.id.replace(/_/g, '-');
            if (_entry_id == _dictionary) {
                message = entry.label;
                if (SPELLRIGHT_DEBUG_OUTPUT) {
                    message = message + ' [' + settings.language + ']';
                }
                return;
            }
        });

        if (settings.documentTypes.indexOf(document.languageId) == (-1) || (helpers._commands.ignore && !helpers._commands.force)) {
            message = '[off]';
            if (helpers._commands.ignore && !helpers._commands.force) {
                color = '#ff5858';
                tooltip = tooltip + 'Forced OFF';
            } else {
                tooltip = tooltip + 'OFF';
            }
        } else {
            if (settings.language == '') {
                message = '[none]';
                tooltip = tooltip + 'No Language Selected';
            } else if (helpers._commands.languages.length > 1 || helpers._commands.nlanguages.length > 0) {
                message = '[multi]';
                tooltip = tooltip + 'Multiple Languages';
                if (helpers._commands.nlanguages.length > 0) {
                    color = '#ff5858';
                    tooltip = tooltip + ' (missing: ';
                    helpers._commands.nlanguages.forEach(function (entry, i, a) {
                        tooltip = tooltip + entry;
                        if (i !== a.length - 1) tooltip = tooltip + ', ';
                    });
                    tooltip = tooltip + ')';
                }
            } else {
                tooltip = tooltip + 'ON';
            }
        }

        this.statusBarItem.text = '$(eye) ' + message;
        this.statusBarItem.color = color;
        this.statusBarItem.tooltip = tooltip;

        if (settings.statusBarIndicator) {
            this.statusBarItem.show();
        } else {
            this.statusBarItem.hide();
        }
    };
    SpellRightIndicator.prototype.isLanguage = function (document) {
        var filePath = document.fileName;
        try {
            fs.accessSync(filePath, fs.W_OK);
            return false;
        }
        catch (error) {
            return true;
        }
    };
    SpellRightIndicator.prototype.hideLanguage = function () {
        if (this.statusBarItem) {
            this.statusBarItem.dispose();
        }
    };
    return SpellRightIndicator;
}());

exports.SpellRightIndicator = SpellRightIndicator;

var SpellRightIndicatorController = (function () {
    function SpellRightIndicatorController(idicator) {
        this.SpellRightIndicator = idicator;
        this.SpellRightIndicator.updateStatusBarIndicator();
        // subscribe to selection change and editor activation events
        var subscriptions = [];
        vscode.window.onDidChangeTextEditorSelection(this.onEvent, this, subscriptions);
        vscode.window.onDidChangeActiveTextEditor(this.onEvent, this, subscriptions);
        // create a combined disposable from both event subscriptions
        this.disposable = vscode.Disposable.from.apply(vscode.Disposable, subscriptions);
    }
    SpellRightIndicatorController.prototype.dispose = function () {
        this.disposable.dispose();
    };
    SpellRightIndicatorController.prototype.onEvent = function () {
        this.SpellRightIndicator.updateStatusBarIndicator();
    };
    return SpellRightIndicatorController;
}());

exports.SpellRightIndicatorController = SpellRightIndicatorController;
