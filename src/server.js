// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017-2018 Bartosz Antosik. Licensed under the MIT License.
// -----------------------------------------------------------------------------

'use strict';

const vscode_languageserver = require('vscode-languageserver');
const vscode_languageserver_types = require('vscode-languageserver-types');
const vscode_uri = require('vscode-uri');

const path = require('path');
const fs = require('fs');
const ignore = require('ignore');
const XRegExp = require('xregexp');

const common = require('./common');

const bindings = require('../lib/bindings');

const langcode = require('../lib/langcode')
const doctype = require('../lib/doctype');
const parser = require('../lib/parser');

// Create a connection for the server.
let connection = vscode_languageserver.createConnection(vscode_languageserver.ProposedFeatures.all);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

let workspaceFolder = undefined;

var _SpellServer;

const CDICTIONARY = 'spellright.dict';

// TODO: Change to "context" or something similar
var helpers = {
    _currentDictionary: '',
    _currentPath: '',
    _UserDictionary: [],
    _WorkspaceDictionary: [],
    _DocumentSymbols: [],
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

connection.onInitialize((params) => {
    workspaceFolder = params.rootUri;

    let capabilities = params.capabilities;
    // Does the client support the `workspace/configuration` request?
    // If not, we will fall back using global settings
    hasConfigurationCapability = !!(capabilities.workspace &&
        !!capabilities.workspace.configuration);
    hasWorkspaceFolderCapability = !!(capabilities.workspace &&
        !!capabilities.workspace.workspaceFolders);
    hasDiagnosticRelatedInformationCapability =
        !!(capabilities.textDocument &&
            capabilities.textDocument.publishDiagnostics &&
            capabilities.textDocument.publishDiagnostics.relatedInformation);

    console.log('onInitialize');

    return {
        capabilities: {
            // Definetly incremental synchronization
            textDocumentSync: vscode_languageserver.TextDocumentSyncKind.Incremental,
            // Tell the client that the server supports code completion
            completionProvider: { resolveProvider: false }
        }
    };
});

connection.onInitialized(() => {
    if (hasConfigurationCapability) {
        // Register for all configuration changes.
        connection.client.register(vscode_languageserver.DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(event => {
        });
    }

    _SpellServer = new SpellServer();
    console.log(_SpellServer);

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

    console.log('onInitialized');
});

connection.onDidChangeConfiguration(change => {
    console.log('onDidChangeConfiguration');
    _SpellServer.getSettings(change.settings.spellright);
});

connection.onDidOpenTextDocument((params) => {
        //     this.doInitiateSpellCheck(document);
        console.log(`${params.textDocument.uri} opened.`);
});

connection.onDidSaveTextDocument((params) => {
    // console.log(`${params.textDocument.uri} saved.`);
});

connection.onDidChangeTextDocument((params) => {
    // console.log(`${params.textDocument.uri} changed: ${JSON.stringify(params.contentChanges)}`);
});

connection.onDidCloseTextDocument((params) => {
    console.log(`${params.textDocument.uri} closed.`);
});

class SpellServer {

    constructor () {
        this.settings = {};
        this.dictionaries = [];
        this.diagnosticMap = {};
        this.ignoreRegExpsMap = [];
        this.latexSpellParameters = [];
        this.lastChanges = null;
        this.lastSyntax = 0;
        this.spellingContext = [];
        this.updateInterval = 1000;
        this.hunspell = false;
    }

    collectDictionaries() {

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
                //  vscode.window.showErrorMessage('SpellRight: The path to dictionaries \"' + this.getDictionariesPath() + '\" does not exist.')
            }
        } else {
            // Other dictionaries are ISO language/culture pairs
            _dictionaries = bindings.getAvailableDictionaries();
        }

        this.dictionaries = [];

        var _this = this;
        _dictionaries.forEach(function (entry) {

            if (SPELLRIGHT_DEBUG_OUTPUT) {
                console.log('[spellright] Adding dictionary [' + entry + '].');
            }

            if (!_this.hunspell) {
                // Native spellcheckers - operate on ISO language codes
                var languageShort = langcode.code2Language(entry);
                if (typeof languageShort !== 'undefined') {
                    if (_this.settings.groupDictionaries) {
                        // Group languages by main ISO entry.
                        if (languageShort in languages) {
                            languages[languageShort].push(entry);
                        } else {
                            languages[languageShort] = [entry];
                        }
                    } else {
                        // Report all language/culture entries.
                        _this.dictionaries.push({
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
                _this.dictionaries.push({
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

                this.dictionaries.push({
                    id: _code,
                    label: key,
                    description: _description
                });
            }
        }
    }

    checkDictionary(dictionary) {

        if (typeof dictionary === 'undefined') return false;

        var result = false;
        this.dictionaries.forEach(function (entry) {
            // Adjust for various LANGUAGE-COUNTRY separators ("_" or "-")
            var _dictionary = dictionary.replace(/_/g, '-');
            var _entry_id = entry.id.replace(/_/g, '-');
            if (_entry_id == _dictionary) {
                result = true;
            }
        });
        return result;
    }

    splitCamelCase(word) {

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

    splitSnakeCase(word) {

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

    splitByOtherWhite(word) {

        // Here split some special cases like: period (`terminal.integrated`),
        // digit (`good2know`), dash (`wp-admin`) etc. Other consequence should
        // be that these words are spelled both as split and as the whole.
        var rother = XRegExp('([^\ \.0-9\-\(\)‘’]+)');
        var rsep = /[\ \.0-9\-\(\)‘’]/;
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

    prepareIgnoreRegExps(languageid) {

        this.ignoreRegExpsMap = [];

        for (var i = 0; i < this.settings.ignoreRegExps.length; i++) {
            try {
                // Convert the JSON of RegExp Strings into a real RegExp
                var flags = this.settings.ignoreRegExps[i].replace(/.*\/([gimy]*)$/, '$1');
                var pattern = this.settings.ignoreRegExps[i].replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
                if (SPELLRIGHT_DEBUG_OUTPUT) {
                    console.log('[spellright] RegExp prepare: ' + this.settings.ignoreRegExps[i] + ' = /' + pattern + '/' + flags);
                }
                this.ignoreRegExpsMap.push(new RegExp(pattern, flags));
            }
            catch (e) {
                // vscode.window.showErrorMessage('SpellRight: Ignore RexExp: \"' + this.settings.ignoreRegExps[i] + '\" malformed. Ignoring.');
                if (SPELLRIGHT_DEBUG_OUTPUT) {
                    console.log('[spellright] Ignore RegExp: \"' + this.settings.ignoreRegExps[i] + '\" malformed. Ignoring.');
                }
            }
        }

        if (this.settings.ignoreRegExpsByClass[languageid]) {
            for (var i = 0; i < this.settings.ignoreRegExpsByClass[languageid].length; i++) {
                try {
                    // Convert the JSON of RegExp Strings into a real RegExp
                    var flags = this.settings.ignoreRegExpsByClass[languageid][i].replace(/.*\/([gimy]*)$/, '$1');
                    var pattern = this.settings.ignoreRegExpsByClass[languageid][i].replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
                    if (SPELLRIGHT_DEBUG_OUTPUT) {
                        console.log('[spellright] RegExp prepare: by Class [' + languageid + ']: \"' + this.settings.ignoreRegExpsByClass[languageid][i] + ' = /' + pattern + '/' + flags);
                    }
                    this.ignoreRegExpsMap.push(new RegExp(pattern, flags));
                }
                catch (e) {
                    // vscode.window.showErrorMessage('SpellRight: Ignore RexExp by Class [' + languageid + ']: \"' + this.settings.ignoreRegExpsByClass[languageid][i] + '\" malformed. Ignoring.');
                    if (SPELLRIGHT_DEBUG_OUTPUT) {
                        console.log('[spellright] Ignore RegExp: \"' + this.settings.ignoreRegExpsByClass[languageid][i] + '\" malformed. Ignoring.');
                    }
                }
            }
        }

        if (this.settings.latexSpellParameters) {
            for (var i = 0; i < this.settings.latexSpellParameters.length; i++) {
                try {
                    // Convert the JSON of RegExp Strings into a real RegExp
                    var pattern = this.settings.latexSpellParameters[i].replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
                    if (SPELLRIGHT_DEBUG_OUTPUT) {
                        console.log('[spellright] RegExp prepare: ' + this.settings.latexSpellParameters[i] + ' = /' + pattern + '/' + 'g');
                    }
                    this.latexSpellParameters.push(new RegExp(pattern, 'g'));
                }
                catch (e) {
                    // vscode.window.showErrorMessage('SpellRight: LaTeX Spell Parameters: \"' + this.settings.ignoreRegExps[i] + '\" malformed. Ignoring.');
                    if (SPELLRIGHT_DEBUG_OUTPUT) {
                        console.log('[spellright] LaTeX Spell Parameters: \"' + this.settings.latexSpellParameters[i] + '\" malformed. Ignoring.');
                    }
                }
            }
        }
    }

    testIgnoreFile(uri) {

        // No workspace folder in this context
        if (!workspaceFolder) {
            return false;
        }

        var uriwpath = workspaceFolder;
        var urifspath = uriwpath.uri.fsPath;

        // Silently ignore files defined by spellright.ignoreFiles
        if (helpers._ignoreFilesSettings.ignores(path.relative(urifspath, uri.fsPath)) || helpers._ignoreFilesSpellignore.ignores(path.relative(urifspath, uri.fsPath))) {
            return true;
        }

        // Test absolute path which is an extension to GitIgnore patterns
        var _absolute = false;
        helpers._ignoreFilesSettings._rules.forEach(function(_i) {
            if (path.relative(_i.pattern, uri.fsPath) === '') _absolute = true;
        });
        helpers._ignoreFilesSpellignore._rules.forEach(function(_i) {
            if (path.relative(_i.pattern, uri.fsPath) === '') _absolute = true;
        });
        if (_absolute)
            return true
        else
            return false;
    }

    testWordInDictionaries(word) {
         for (var i = 0; i < helpers._UserDictionary.length; i++) {
             if (helpers._UserDictionary[i].toLowerCase() == word.toLowerCase().trim())
                 return true;
         }
         for (var i = 0; i < helpers._WorkspaceDictionary.length; i++) {
             if (helpers._WorkspaceDictionary[i].toLowerCase() == word.toLowerCase().trim())
                 return true;
         }
        for (var i = 0; i < helpers._DocumentSymbols.length; i++) {
            if (helpers._DocumentSymbols[i] == word.trim())
                return true;
        }
         return false;
    }

    getEffectiveLanguage() {
        // The hierarchy should be from topmost to lowest: In-Document Command,
        // Context, Default language chosen for spelling of the current word.

        if (this.spellingContext[0]._languageCommand.length > 0) {
            return this.spellingContext[0]._languageCommand;
        } else if (this.spellingContext[0]._languageContext.length > 0) {
            return this.spellingContext[0]._languageContext;
        } else {
            return this.spellingContext[0]._languageDefault;
        }
    }

    checkAndMarkCallback(document, context, diagnostics, token, linenumber, colnumber) {

        var _linenumber = linenumber;
        var _colnumber = colnumber;

        if (SPELLRIGHT_DEBUG_OUTPUT && false) {
            console.log('[spellright] Spell [' + context + ']: \"' + token.word + '\"');
        }

        // Check if current context not disabled by syntatic control
        if (this.settings.spellContextByClass[document.languageId]) {
            if (this.settings.spellContextByClass[document.languageId].indexOf(context) == (-1)) {
                return;
            }
        } else if (this.settings.spellContext.indexOf(context) == (-1)) {
            return;
        }

        // Set language for the current syntactical context
        if (this.settings.languageContextByClass[document.languageId]) {
            this.spellingContext[0]._languageContext = this.readAsArray(this.settings.languageContextByClass[document.languageId][context]);
        } else if (this.settings.languageContext[context]) {
            this.spellingContext[0]._languageContext = this.readAsArray(this.settings.languageContext[context]);
        } else {
            this.spellingContext[0]._languageContext = [];
        }

        // Words are selected by language specific parsers but from here on
        // they are treated in the same way so these are operations done on
        // every word/lexem spelled.

        var cword = token.word;

        // Special case of words ending with period - abbreviations, etc.
        // Also cleanup for situations like: "peoples'." or LaTeX ""``up''".
        var _endsWithPeriod = cword.endsWith('.');
        var _startsWithPeriod = cword.startsWith('.');
        var _endsWithApostrophe = cword.endsWith('\'') || cword.endsWith('\u2019');
        while (cword.endsWith('.') || cword.endsWith('\'') || cword.endsWith('\u2019')) {
            _endsWithPeriod = cword.endsWith('.');
            _endsWithApostrophe = cword.endsWith('\'') || cword.endsWith('\u2019');

            cword = cword.slice(0, -1);
        }

        while (cword.startsWith('.') || cword.startsWith('\'')) {
            cword = cword.slice(1);
            _colnumber++;
        }
        var _containsPeriod = /[\.]/.test(cword);
        var _containsApostrophe = /[\'\u2019]/.test(cword);
        var _containsDash = /[-]/.test(cword);
        var _containsDigitInside = /\D\d\D/.test(cword);
        var _containsEmoji = /[\ue000-\uf8ff]|\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]/.test(cword);
        var _parentheticalPlural = /^\w+\((\w{1,2})\)$/.test(cword);
        var _containsParenthesis = /[\(\)]/.test(cword);
        var _possesiveApostrophe = /^\w+[\'\u2019]s$/.test(cword);

        // Detect placeholder replacement ("_") in used in markdown to
        // avoid false detection of indented code blocks in situation when
        // something is removed by regular expression or other rules.
        if (/_+/.test(cword)) {
            if (/_+/.exec(cword)[0].length == cword.length) return;
        }

        // Emojis crash Hunspell both on Linux and Windows
        if (_containsEmoji && this.hunspell) {
            return;
        }

        // Hunspell does not understand curly apostrophe
        if (_containsApostrophe && this.hunspell) {
            cword = cword.replace(/\u2019/g, '\'');
        }

        if (_parentheticalPlural) {
            // Here spell special case of parenthical plural (one or two
            // characters in parenthesis directly glued to the word, like
            // word(s), process(es) etc.)
            var ppmatch = /^(\w+)\((\w{1,2})\)$/;
            var match = ppmatch.exec(cword);
            cword = match[1];
        }

        if (!_parentheticalPlural && _containsParenthesis) {
            // Clean up after passing parenthesis for parentical plural
            cword = cword.replace(/\(/g, ' ');
            cword = cword.replace(/\)/g, ' ');
        }

        if (_possesiveApostrophe) {
            // Here spell special case of possesive 's
            var ppmatch = /^(\w+)[\'\u2019]s$/;
            var match = ppmatch.exec(cword);
            cword = match[1];
        }

        var _effectiveLanguages = this.getEffectiveLanguage();

        // Here check if the word is correct in ANY of the languages. If it is
        // then exit. If it is incorrect in ALL of them then proceed.
        for (var _li = 0; _li < _effectiveLanguages.length; _li++) {

            var _effectiveLanguage = _effectiveLanguages[_li];

            this.setDictionary(_effectiveLanguage);

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
        }

        // Split words containing period inside. Period does not break words
        // because it is part of legit abbreviations (e.g., i.e., etc.) which
        // should be spelled as well. So there can be lexems containing periods
        // inside. But they should be later on spelled as parts to minimize
        // the number of false positives. Same about apostrophe and few other
        // white/punctuation/graphical characters which are permitted above.
        var _split = this.splitByOtherWhite(cword);
        if (_split.length > 1) {

            // Heal "(inkl. " like sitautions here
            if (_endsWithPeriod) {
                _split[_split.length - 1].word = _split[_split.length - 1].word + '.';
            }
            var _this = this;
            _split.forEach (function(e) {
                if (e.word.length >= 2) {

                    var _token = { word: e.word, parent: cword, parser: token.parser };
                    var _source = '';
                    var _offset = e.offset;

                    if (token.map) {
                        _offset = 0;
                        for (var _i = 0; _i < e.offset; _i++) {
                            _offset += token.map[_i].length;
                        }
                        for (var _i = e.offset; _i < e.offset + e.word.length; _i++) {
                            _source += token.map[_i];
                        }
                        _token.source = _source;
                    }

                    _this.checkAndMarkCallback(document, context, diagnostics, _token, _linenumber, _colnumber + _offset);
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

                    var _token = { word: e.word, parent: cword, parser: token.parser };
                    var _source = '';
                    var _offset = e.offset;

                    if (token.map) {
                        _offset = 0;
                        for (var _i = 0; _i < e.offset; _i++) {
                            _offset += token.map[_i].length;
                        }
                        for (var _i = e.offset; _i < e.offset + e.word.length; _i++) {
                            _source += token.map[_i];
                        }
                        _token.source = _source;
                    }

                    _this.checkAndMarkCallback(document, context, diagnostics, _token, _linenumber, _colnumber + _offset);
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

                    var _token = { word: e.word, parent: cword, parser: token.parser };
                    var _source = '';
                    var _offset = e.offset;

                    if (token.map) {
                        _offset = 0;
                        for (var _i = 0; _i < e.offset; _i++) {
                            _offset += token.map[_i].length;
                        }
                        for (var _i = e.offset; _i < e.offset + e.word.length; _i++) {
                            _source += token.map[_i];
                        }
                        _token.source = _source;
                    }

                    _this.checkAndMarkCallback(document, context, diagnostics, _token, _linenumber, _colnumber + _offset);
                }
            });
            return;
        }

        // Punctuation cleaned version of the word

        for (var _li = 0; _li < _effectiveLanguages.length; _li++) {

            var _effectiveLanguage = _effectiveLanguages[_li];

            this.setDictionary(_effectiveLanguage);

            // Special case of words ending with period - if spelling
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

            // Parenthesis e.g. brought by parenthical plurals
            if (_containsParenthesis) {
                if (!bindings.isMisspelled(cword.trim())) {
                    return;
                }
            }
        }

        if (_containsDash) {
            return;
        }

        if (token.source) {
            var _size = token.source.length;
        } else {
            var _size = cword.length;
        }

        // Avoid proposing a word with a dot to be added to dictionary
        if (_startsWithPeriod || _endsWithPeriod || _containsParenthesis) {
            token.word = cword;
        }

        var message = '\"' + cword + '\"';

        var hints = '';
        var hintCount = 0;

        if (SPELLRIGHT_DEBUG_OUTPUT) {
            message += ' (' + context + ')';
        }

        var range = new vscode_languageserver_types.Range(_linenumber, _colnumber, _linenumber, _colnumber + _size);

        if (this.settings.suggestionsInHints) {

            for (var _li = 0; _li < _effectiveLanguages.length; _li++) {

                var _effectiveLanguage = _effectiveLanguages[_li];

                this.setDictionary(_effectiveLanguage);

                var suggestions = bindings.getCorrectionsForMisspelling(cword);

                hintCount += suggestions.length;

                if (suggestions.length > 0) {
                    if (helpers._commands.languages.length > 1 || helpers._commands.nlanguages.length > 0) {
                        hints += ' [' + _effectiveLanguage + ']: ';
                    } else {
                        hints += ': ';
                    }
                    for (var _i = 0, suggestions_1 = suggestions; _i < suggestions_1.length; _i++) {
                        var s = suggestions_1[_i];
                        hints += s + ', ';
                    }
                    hints = hints.slice(0, hints.length - 2);
                }
            }

            if (hintCount == 0) {
                message += ': no suggestions';
            } else {
                message += ': suggestions' + hints;
            }
        }

        var diagnosticsType = vscode_languageserver_types.DiagnosticSeverity.Error;

        if (this.settings.notificationClass === 'warning') {
            diagnosticsType = vscode_languageserver_types.DiagnosticSeverity.Warning;
        } else if (this.settings.notificationClass === 'information') {
            diagnosticsType = vscode_languageserver_types.DiagnosticSeverity.Information;
        } else if (this.settings.notificationClass === 'hint') {
            diagnosticsType = vscode_languageserver_types.DiagnosticSeverity.Hint;
        }

        if (this.settings.notificationClassByParser[token.parser] === 'warning') {
            diagnosticsType = vscode_languageserver_types.DiagnosticSeverity.Warning;
        } else if (this.settings.notificationClassByParser[token.parser] === 'information') {
            diagnosticsType = vscode_languageserver_types.DiagnosticSeverity.Information;
        } else if (this.settings.notificationClassByParser[token.parser] === 'hint') {
            diagnosticsType = vscode_languageserver_types.DiagnosticSeverity.Hint;
        }

        var diag = new vscode_languageserver_types.Diagnostic(range, message, diagnosticsType);
        diag.source = 'spelling';

        // Extend with context for actions provided in suggestions menu
        diag['token'] = token;
        diag['language'] = _effectiveLanguages;
        diag['context'] = context;
        diag['range'] = range;

        // Now insert diagnostics at the right place
        var append = false;
        if (diagnostics.length > 0) {
            var _drange = diagnostics[diagnostics.length - 1].range;
            // At the end if fits there
            append = (_linenumber > _drange._end._line ||
                (_linenumber == _drange._end._line &&
                _colnumber >= _drange._end._character));
        } else {
            // Definitely at the end!
            append = true;
        }

        if (append) {
            diagnostics.push(diag);
        } else {
            // Linear search. This should maybe be bisection or some
            // other algorithm in the future, but on the other hand
            // this code is called only on differential edits so there
            // are very few calls thus it should not degrade performance.
            for (var i = 0; i < diagnostics.length; i++) {
                var _drange = diagnostics[i].range;
                if (_drange._end.isBeforeOrEqual(diag.range.start))
                    continue;
                diagnostics.splice(i, 0, diag);
                break;
            }
        }
    }

    commandCallback(command, parameters) {
        if (this.spellingContext.length > 0) {
            if (command === 'on') {
                this.spellingContext[0]._enabled = true;
            } else if (command === 'off') {
                this.spellingContext[0]._enabled = false;
            } else if (command === 'language') {
                if (parameters) {
                    var _this = this;
                    this.splitParams(parameters, ' ', false).forEach(function (_parameter) {
                        if (_this.checkDictionary(_parameter)) {
                            _this.spellingContext[0]._languageCommand.push(_parameter);
                        }
                    });
                } else {
                    this.spellingContext[0]._languageCommand = [];
                }
            }
        }
    }

    // Remove diagnostics in lines that were touched by change and in case
    // change brings any shift up/down - shift diagnostics.
    adjustDiagnostics(diagnostics, range, shift) {

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
                        diagnostics[i].range._start._line += shift;
                        diagnostics[i].range._end._line += shift;
                    }
                }
            }
        }
    }

    removeFromDiagnostics(diagnostics, word) {
        var _removed = 0;
        for (var j = diagnostics.length; j > 0 ; j--) {
            var _token = diagnostics[j - 1]['token'];
            if (_token.word === word || _token.parent === word) {
                diagnostics.splice(j - 1, 1);
                _removed++;
            }
        }
        return _removed;
    }

    doRefreshConfiguration(event) {
        // Remove all diagnostics
        this.diagnosticCollection.clear();
        this.diagnosticMap = {};

        indicator.updateStatusBarIndicator();
        this.doInitiateSpellCheckVisible(true);
    }

    doInitiateSpellCheckVisible(force = false) {
        this.doCancelSpellCheck();
        if (vscode.window.activeTextEditor) {
            var _active = vscode.window.activeTextEditor.document;
            if (vscode.window.activeTextEditor && _active) {
                this.doInitiateSpellCheck(_active, force);
            }
            vscode.window.visibleTextEditors.forEach((editor, index) => {
                if (editor !== vscode.window.activeTextEditor) {
                    var _document = editor.document;
                    if (_document) {
                        this.doInitiateSpellCheck(_document, force);
                    }
                }
            });
        }
        indicator.updateStatusBarIndicator();
    }

    doInitiateSpellCheck(document, force = false) {

        var _document = document;

        helpers._commands.syntax = 0;
        helpers._commands.signature = '';
        helpers._commands.ignore = false;
        helpers._commands.force = false;

        var _this = this;

        this.getSettings(_document);

        // Is off for this document type?
        if (this.settings.documentTypes.indexOf(_document.languageId) == (-1)) {
            this.doCancelSpellCheck();
            indicator.updateStatusBarIndicator();
            this.diagnosticCollection.delete(_document.uri);
            this.diagnosticMap[_document.uri.toString()] = undefined;
            return;
        }

        // Is language set to "none"?
        if (this.settings.language == []) {
            return;
        }

        // Is this a private URI? (VSCode started having 'private:' versions
        // of non-plaintext documents with languageId = 'plaintext')
        if (_document.uri.scheme != 'file' && _document.uri.scheme != 'untitled') {
            return;
        }

        // Speller was already started && do not spell what's
        // already spelled, just diff watch differences
        var initiate = (this.spellingContext.length == 0);

        // Select appropriate parser
        const _parser = doctype.fromDocument(this.settings, _document);

        // No parser for this type of document
        if (_parser == null) {
            return;
        }

        this.getDocumentSymbols(_document, _parser);

        var _context = {
            _document: _document,
            _parser: _parser,
            _diagnostics: [],
            _line: 0,
            _start: Date.now(),
            _update: Date.now(),
            _languageDefault: this.settings.language.slice(),
            _languageContext: [],
            _languageCommand: [],
            _enabled: true
        };

        var _return = { syntax: 0, linecount: 0 };
        var _signature = '';

        var _length = this.spellingContext.length;

        _return = _parser.parseForCommands(_document, { ignoreRegExpsMap: this.ignoreRegExpsMap,
            latexSpellParameters: this.latexSpellParameters }, function (command, parameters, range) {

            _signature = command + '-' + parameters;

            if (SPELLRIGHT_DEBUG_OUTPUT) {
                console.log('[spellright] In-Document Command: ' + command + ' [' + parameters + ']');
            }
            if (command === 'off') {
                helpers._commands.ignore = true;
            }
            if (command === 'on') {
                helpers._commands.force = true;
            }
            if (command === 'language') {
                if (parameters) {
                    _this.splitParams(parameters, ' ', false).forEach(function (_parameter) {
                        if (_this.checkDictionary(_parameter)) {
                            // It has to be push, because the order and
                            // repetition of languages makes the difference.
                            helpers._commands.languages.push(_parameter);
                        } else {
                            parser.pushIfNotExist(helpers._commands.nlanguages, _parameter, function (e) {
                                return e === _parameter;
                            });
                        }
                    });
                }
            }
        }, function (context) {
            if (this.settings.languageContextByClass[_document.languageId]) {
                var _language = _this.readAsArray(this.settings.languageContextByClass[_document.languageId][context]);
            } else if (this.settings.languageContext[context]) {
                var _language = _this.readAsArray(this.settings.languageContext[context]);
            }
            if (_language) {
                if (_this.checkDictionary(_language)) {
                    // It has to be push, because the order and
                    // repetition of languages makes the difference.
                    helpers._commands.languages.push(_language);
                } else {
                    parser.pushIfNotExist(helpers._commands.nlanguages, _language, function (e) {
                        return e === _language;
                    });
                }
            }
        });

        helpers._commands.syntax = _return.syntax;
        helpers._commands.signature = _signature;

        // .spellignore tested here so it can be overriden by InDoc command(s)
        if (this.testIgnoreFile(_document.uri)) {
            helpers._commands.ignore = true;
        }

        indicator.updateStatusBarIndicator();

        // Ignore spelling forced
        if (helpers._commands.ignore && !helpers._commands.force) {
            if (typeof this.diagnosticMap[_document.uri.toString()] !== 'undefined') {
                this.diagnosticCollection.delete(_document.uri);
                this.diagnosticMap[_document.uri.toString()] = undefined;
            }
            return;
        }

        // Already spelled, needs cleaned diagnostics to respell
        if (this.diagnosticMap[_document.uri.toString()] !== undefined && !force) {
            return;
        }

        // The array spellingContext holds queue of documents to be spelled
        // successively. New documents are put in position 0 so that no matter
         // what was spelled a currently opened document will be spelled first.
        var _index = this.spellingContext.findIndex(e => e._document.uri === _context._document.uri);

        if (_index != -1) {
            // Move from position N to zero, only it it is not already on 0
            if (_index > 0) {
                this.spellingContext.splice(0, 0, this.spellingContext[_index]);
                this.spellingContext.splice(_index + 1, 1);
            }
        } else {
            this.spellingContext.splice(0, 0, _context);
        }

        if (SPELLRIGHT_DEBUG_OUTPUT) {
            console.log('[spellright] Spelling of \"' + _document.fileName + '\" [' + _document.languageId + '] STARTED.');
        }

        if (initiate) {
            // The rest is done "OnIdle" state
            setImmediate(function () { _this.doStepSpellCheck(_this) });
        }
    }

    doStepSpellCheck(_this) {

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

            _return = parser.spellCheckRange(document, diagnostics, { ignoreRegExpsMap: this.ignoreRegExpsMap, latexSpellParameters: this.latexSpellParameters }, (document, context, diagnostics, token, linenumber, colnumber) => _this.checkAndMarkCallback(document, context, diagnostics, token, linenumber, colnumber), (command, parameters) => this.commandCallback(command, parameters), line, void 0, line + (SPELLRIGHT_LINES_BATCH - 1), void 0);

            // Update interface with already collected diagnostics
            if (this.updateInterval > 0) {
                if (Date.now() - update > this.updateInterval) {
                    _this.diagnosticMap[document.uri.toString()] = diagnostics;
                    _this.diagnosticCollection.set(document.uri, diagnostics.slice(0));

                    _this.spellingContext[0]._update = Date.now();
                }
            }

            // Push spelling a few lines forward
            _this.spellingContext[0]._line += SPELLRIGHT_LINES_BATCH;

        } else {
            _this.diagnosticMap[document.uri.toString()] = diagnostics;
            _this.diagnosticCollection.set(document.uri, diagnostics.slice(0));

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

    doCancelSpellCheck() {
        var _this = this;
        if (this.spellingContext[0] !== null) {
            this.spellingContext.forEach((context, index, array) => {
                _this.diagnosticMap[context._document.uri.toString()] = undefined;
                _this.diagnosticCollection.set(context._document.uri, []);

                if (SPELLRIGHT_DEBUG_OUTPUT) {
                    console.log('[spellright] Spelling of \"' + context._document.fileName + '\" [' + context._document.languageId + '] CANCELLED.');
                }

                _this.spellingContext.shift();
            });
        }
    }

    doDiffSpellCheck(event) {

        var _document = event.document;

        helpers._commands.ignore = false;
        helpers._commands.force = false;

        var _this = this;

        var _languages = helpers._commands.languages.slice();
        var _nlanguages = helpers._commands.nlanguages.slice();

        this.getSettings(_document);

        // Is off for this document type?
        if (this.settings.documentTypes.indexOf(_document.languageId) == (-1)) {
            this.doCancelSpellCheck();
            indicator.updateStatusBarIndicator();
            this.diagnosticCollection.delete(_document.uri);
            this.diagnosticMap[_document.uri.toString()] = undefined;
            return;
        }

        // Is language set to "none"?
        if (this.settings.language == []) {
            return;
        }

        var _parser = doctype.fromDocument(this.settings, _document);

        if (_parser == null) {
            return
        };

        this.getDocumentSymbols(_document, _parser);

        var _return = { syntax: 0, linecount: 0 };
        var _signature = '';
        var _local_context = false;

        _return = _parser.parseForCommands(_document, { ignoreRegExpsMap: this.ignoreRegExpsMap, latexSpellParameters: this.latexSpellParameters }, function (command, parameters, range) {

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
            if (command === 'language') {
                if (parameters) {
                    _this.splitParams(parameters, ' ', false).forEach(function (_parameter) {
                        if (_this.checkDictionary(_parameter)) {
                            // It has to be push, because the order and
                            // repetition of languages makes the difference.
                            helpers._commands.languages.push(_parameter);
                        } else {
                            parser.pushIfNotExist(helpers._commands.nlanguages, _parameter, function (e) {
                                return e === _parameter;
                            });
                        }
                    });
                }
            }
        }, function (context) {
            if (this.settings.languageContextByClass[_document.languageId]) {
                var _language = _this.readAsArray(this.settings.languageContextByClass[_document.languageId][context]);
            } else if (this.settings.languageContext[context]) {
                var _language = _this.readAsArray(this.settings.languageContext[context]);
            }
            if (_language) {
                if (_this.checkDictionary(_language)) {
                    // It has to be push, because the order and
                    // repetition of languages makes the difference.
                    helpers._commands.languages.push(_language);
                } else {
                    parser.pushIfNotExist(helpers._commands.nlanguages, _language, function (e) {
                        return e === _language;
                    });
                }
            }
        });

        // .spellignore tested here so it can be overriden by InDoc command(s)
        if (this.testIgnoreFile(_document.uri)) {
            helpers._commands.ignore = true;
        }

        indicator.updateStatusBarIndicator();

        // Ignore spelling forced
        if (helpers._commands.ignore && !helpers._commands.force) {
            if (typeof this.diagnosticMap[_document.uri.toString()] !== 'undefined') {
                this.doCancelSpellCheck();
                this.diagnosticCollection.delete(_document.uri);
                this.diagnosticMap[_document.uri.toString()] = undefined;
            }
            return;
        }

        if (_languages.toString() !== helpers._commands.languages.toString()) {
            if (SPELLRIGHT_DEBUG_OUTPUT) {
                console.log('[spellright] In-Document language changed, rechecking');
            }
            this.doCancelSpellCheck();
            this.doInitiateSpellCheck(_document, true);
            return;
        } else if (typeof this.diagnosticMap[_document.uri.toString()] === 'undefined') {
            this.doInitiateSpellCheck(_document);
            return;
        }

        // If the document is being spelled (e.g. is large) adjust diagnostics
        // that are being prepared in the background, not those from the store.
        var diagnostics = [];

        if (this.spellingContext.length == 0) {
            diagnostics = this.diagnosticMap[_document.uri.toString()];

            // Create temporary context
            var _context = {
                _document: _document,
                _parser: _parser,
                _diagnostics: diagnostics,
                _line: 0,
                _start: Date.now(),
                _update: Date.now(),
                _languageDefault: this.settings.language.slice(),
                _languageContext: [],
                _languageCommand: [],
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

            _parser.spellCheckRange(_document, diagnostics, { ignoreRegExpsMap: this.ignoreRegExpsMap, latexSpellParameters: this.latexSpellParameters }, (_document, context, diagnostics, token, linenumber, colnumber) => this.checkAndMarkCallback(_document, context, diagnostics, token, linenumber, colnumber), (command, parameters) => this.commandCallback(command, parameters), range.start.line, range.start.character, range.end.line + shift, range.end.character);
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

                        _parser.spellCheckRange(_document, diagnostics, { ignoreRegExpsMap: this.ignoreRegExpsMap, latexSpellParameters: this.latexSpellParameters }, (_document, context, diagnostics, token, linenumber, colnumber) => this.checkAndMarkCallback(_document, context, diagnostics, token, linenumber, colnumber), (command, parameters) => this.commandCallback(command, parameters), range.start.line + shift, void 0, range.end.line + shift, void 0);
                    }
                }
            }
            this.lastChanges = null;
        }
        // Save it for next pass change/jump detection
        this.lastChanges = event.contentChanges;

        if (_local_context)
            this.spellingContext.shift();

        this.diagnosticMap[_document.uri.toString()] = diagnostics;
        this.diagnosticCollection.set(_document.uri, diagnostics.slice(0));

        if (helpers._commands.syntax != _return.syntax ||
            helpers._commands.signature !== _signature) {
            this.doCancelSpellCheck();
            helpers._commands.syntax = _return.syntax;
            helpers._commands.signature = _signature;
            this.doInitiateSpellCheck(_document);
        }
    }

    getDictionariesPath () {

        // TODO: Do something about 'appName'
        // var codeFolder = vscode.env.appName.replace("Visual Studio ", "");
        var codeFolder = "Code";

        if (process.platform == 'win32') {
            // Regular version, workspace opened
            if (process.env.VSCODE_PORTABLE) {
                var sourcePath = path.join(process.env.VSCODE_PORTABLE, 'user-data');
            } else {
                var sourcePath = path.join(process.env.APPDATA, codeFolder);
            }
        } else if (process.platform == 'darwin') {
            if (process.env.VSCODE_PORTABLE) {
                var sourcePath = path.join(process.env.VSCODE_PORTABLE, 'user-data');
            } else {
                var sourcePath = path.join(process.env.HOME, 'Library', 'Application Support', codeFolder);
            }
        } else if (process.platform == 'linux') {
            if (process.env.VSCODE_PORTABLE) {
                var sourcePath = path.join(process.env.VSCODE_PORTABLE, 'user-data');
            } else {
                var sourcePath = path.join(process.env.HOME, '.config', codeFolder);
            }
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
    }

    getSettings(_settings = undefined, _document = undefined) {
        var uri = undefined;
        var uriwpath = undefined;
        var urifspath = '';
        var languageid = undefined;

        if (_settings !== undefined) {
            this.settings = _settings;
        }

        if (_document !== undefined) {
            uri = _document.uri;
            languageid = _document.languageId;
            uriwpath = connection.workspace.getWorkspaceFolder(uri);
            if (uriwpath !== undefined) {
                urifspath = uriwpath.uri.fsPath;
            }
        }

        this.settings.language = this.readAsArray(this.settings.language);
        this.settings.parserByClass = Object.assign({}, this.settings.parserByClass);

        this.collectDictionaries();

        helpers._commands.languages = [];
        helpers._commands.nlanguages = [];

        var _this = this;

        this.settings.language.slice().forEach(function (_parameter) {
            if (_this.checkDictionary(_parameter)) {
                helpers._commands.languages.push(_parameter);
            } else {
                parser.pushIfNotExist(helpers._commands.nlanguages, _parameter, function (e) {
                    return e === _parameter;
                });
            }
        });

        this.prepareIgnoreRegExps(languageid);

        helpers._ignoreFilesSettings = ignore();
        this.settings.ignoreFiles.forEach(function (key) {
            helpers._ignoreFilesSettings.add(key);
        });

        helpers._UserDictionary = this.readDictionaryFile(this.getUserDictionaryFilename());

        // Here loading workspace "per resource" dictionaries
        if (uri && connection.workspace.getWorkspaceFolder(uri)) {
            helpers._WorkspaceDictionary = this.readDictionaryFiles(urifspath);
            helpers._ignoreFilesSpellignore = this.readIgnoreFile(urifspath);
        }

        return;
    }

    getUserDictionaryFilename() {

        // TODO: Do something about 'appName'
        // var codeFolder = vscode.env.appName.replace("Visual Studio ", "");
        var codeFolder = "Code";

        if (process.platform == 'win32')
            if (process.env.VSCODE_PORTABLE) {
                return path.join(process.env.VSCODE_PORTABLE, 'user-data', 'User', CDICTIONARY);
            } else {
                return path.join(process.env.APPDATA, codeFolder, 'User', CDICTIONARY);
            }
        else if (process.platform == 'darwin')
            if (process.env.VSCODE_PORTABLE) {
                return path.join(process.env.VSCODE_PORTABLE, 'user-data', 'User', CDICTIONARY);
            } else {
                return path.join(process.env.HOME, 'Library', 'Application Support', codeFolder, 'User', CDICTIONARY);
            }
        else if (process.platform == 'linux')
            if (process.env.VSCODE_PORTABLE) {
                return path.join(process.env.VSCODE_PORTABLE, 'user-data', 'User', CDICTIONARY);
            } else {
                return path.join(process.env.HOME, '.config', codeFolder, 'User', CDICTIONARY);
            }
        else
            return '';
    }

    readDictionaryFile(fileName) {

        if (fileName.length > 0) {
            if (fs.existsSync(fileName)) {
                var result = [];
                try {
                    result = require('fs')
                        .readFileSync(fileName, 'utf-8')
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

    readDictionaryFiles(pathName) {
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

    readIgnoreFile(ipath) {
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

    readAsArray(_language) {
        // Correct old style configuration (string to array)
        if (Array.isArray(_language)) {
            return _language;
        } else {
            return [_language];
        }
    }

};

connection.listen();

Object.defineProperty(exports, "__esModule", { value: true });
