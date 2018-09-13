// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017-2018 Bartosz Antosik. Licensed under the MIT License.
// -----------------------------------------------------------------------------

'use strict';

const vscode = require('vscode');

global.SPELLRIGHT_LEXEM_BUILD = /[^\s,!\\?\*\/:\[\]\{\}\"\`\+\<\>\;\=\#\$\&\%\^\@\|\~…–«»„“”‹›\uff0c\u3002\u3001\u300a\u300b\uff1f\uff01\uff1b\uff1a\u2018\u201c\u201d\u300c\u300d\uff08\uff09\u3010\u3011\u3008\u3009]/;
global.SPELLRIGHT_LEXEM_SPELL = /[\s,!\\?\*\/:\[\]\{\}\"\`\+\<\>\;\=\#\$\&\%\^\@\|\~…–«»„“”‹›\uff0c\u3002\u3001\u300a\u300b\uff1f\uff01\uff1b\uff1a\u2018\u201c\u201d\u300c\u300d\uff08\uff09\u3010\u3011\u3008\u3009]/;

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
global.SPELLRIGHT_COMMAND = /spellcheck(?:-|:[\s]*)([\w]+)([^\r\n]*)/g;

// -----------------------------------------------------------------------------
// Special command form for LaTeX parser to parse LaTeX 'magic comments’.
// Extracts only one command which allows to change spelling language and is
// functional equivalent of: spellcheck-language "CODE".
//
// !TEX spellcheck = "CODE"
//
// -----------------------------------------------------------------------------
global.SPELLRIGHT_COMMAND_TEX = /\!TEX[\s]+spellcheck[\s]*\=[\s]*\"([^\"]*)\"/g;

exports.replaceAt = function(text, index, character) {
    return text.substr(0, index) + character + text.substr(index + character.length);
}

exports.inArray = function (array, comparer) {
    for (var i = 0; i < array.length; i++) {
        if (comparer(array[i])) return true;
    }
    return false;
}

exports.pushIfNotExist = function (array, element, compare) {
    if (!this.inArray(array, compare)) {
        array.push(element);
    }
}

// base class for different sorts of document handlers
class Parser {

    parseForCommands(document, options, commandCallback, contextCallback) {
        var _diagnostics = [];
        var _context = '';

        SPELLRIGHT_LEXEM_BUILD.lastIndex = 0;
        SPELLRIGHT_LEXEM_SPELL.lastIndex = 0;
        SPELLRIGHT_COMMAND.lastIndex = 0;

        return this._parse(document, _diagnostics, options, function (document, context, diagnostics, token, linenumber, colnumber) {
            if (context != _context) {
                contextCallback(context);
            }
            _context = context;
        }, commandCallback, void 0, void 0, void 0, void 0);
    }
    spellCheckRange(document, diagnostics, options, markCallback, commandCallback, sline, scharacter, eline, echaracter) {
        SPELLRIGHT_LEXEM_BUILD.lastIndex = 0;
        SPELLRIGHT_LEXEM_SPELL.lastIndex = 0;
        SPELLRIGHT_COMMAND.lastIndex = 0;

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
exports.default = Parser;
