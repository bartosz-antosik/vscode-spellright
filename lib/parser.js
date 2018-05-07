// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017-2018 Bartosz Antosik. Licensed under the MIT License.
// -----------------------------------------------------------------------------

'use strict';

const vscode = require('vscode');

global.LEXEM_BUILD = /[^\s,!\\?\*\/:\[\]\{\}\"\`\+\<\>\;\=\#\$\&\%\^\@\|\~\uff0c\u3002\u3001\u300a\u300b\uff1f\uff01\uff1b\uff1a\u2018\u201c\u2019\u201d\u300c\u300d\uff08\uff09\u3010\u3011]/;
global.LEXEM_SPELL = /[\s,!\\?\*\/:\[\]\{\}\"\`\+\<\>\;\=\#\$\&\%\^\@\|\~\uff0c\u3002\u3001\u300a\u300b\uff1f\uff01\uff1b\uff1a\u2018\u201c\u2019\u201d\u300c\u300d\uff08\uff09\u3010\u3011]/;

// -----------------------------------------------------------------------------
// ## In-Document command format:
//
// spellcheck-[command] [parameter]
//
// ## Commands DONE
//
// off
// on
// language "[language|language-region|dictionary]"
//
// ## Commands TO CONSIDER
//
// enable
// disable
// ignorewords "list"
// ignoreregexps "list"
//
// Quoting in Markdown: <code>spellcheck&#8208;language&nbsp;en-US</code>
// -----------------------------------------------------------------------------
global.COMMAND = /spellcheck(?:-|:[\s]*)([\w]+)\s+\"([^\"]*)\"/g;

// -----------------------------------------------------------------------------
// Special command form for LaTeX parser to parse LaTeX 'magic comments’.
// Extracts only one command which allows to change spelling language and is
// functional equivalent of: spellcheck-language "CODE".
//
// !TEX spellcheck = "CODE"
//
// -----------------------------------------------------------------------------
global.COMMAND_TEX = /\!TEX[\s]+spellcheck[\s]*\=[\s]*\"([^\"]*)\"/g;

String.prototype.replaceAt = function (index, character) {
    return this.substr(0, index) + character + this.substr(index + character.length);
}

Array.prototype.inArray = function (comparer) {
    for (var i = 0; i < this.length; i++) {
        if (comparer(this[i])) return true;
    }
    return false;
}

Array.prototype.pushIfNotExist = function (element, compare) {
    if (!this.inArray(compare)) {
        this.push(element);
    }
}

// base class for different sorts of document handlers
class DocumentProcessor {
    parseForCommands(document, options, commandCallback) {
        var _diagnostics = [];

        LEXEM_BUILD.lastIndex = 0;
        LEXEM_SPELL.lastIndex = 0;
        COMMAND.lastIndex = 0;

        return this._parse(document, _diagnostics, options, function (document, context, diagnostics, token, linenumber, colnumber) {}, commandCallback, void 0, void 0, void 0, void 0);
    }
    spellCheckRange(document, diagnostics, options, markCallback, commandCallback, sline, scharacter, eline, echaracter) {
        LEXEM_BUILD.lastIndex = 0;
        LEXEM_SPELL.lastIndex = 0;
        COMMAND.lastIndex = 0;

        return this._parse(document, diagnostics, options, markCallback, commandCallback, sline, scharacter, eline, echaracter);
    }
    spellCheckAll(document, diagnostics, options, markCallback, commandCallback) {
        var startline = 0;
        var endline = Number.MAX_SAFE_INTEGER;

        return this.spellCheckRange(document, markCallback, options, commandCallback, startline, void 0, endline, void 0);
    }

    _parse(document, diagnostics, options, markCallback, commandCallback, sline, scharacter, eline, echaracter) {
        return { syntax: 0, linecount: 0 };
    }
}
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = DocumentProcessor;