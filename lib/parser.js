// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017 Bartosz Antosik. Licensed under the MIT License.
// -----------------------------------------------------------------------------

'use strict';

const vscode_1 = require('vscode');

global.LEXEM_BUILD = /[^\s,!\\?\*\/:\[\]\(\)\"\`\-\+\<\>\;\=]/;
global.LEXEM_SPELL = /[\s,!\\?\*\/:\[\]\(\)\"\`\-\+\<\>\;\=]/;

String.prototype.replaceAt = function (index, character) {
    return this.substr(0, index) + character + this.substr(index + character.length);
}

// base class for different sorts of document handlers
class DocumentProcessor {
    spellCheckRange(document, diagnostics, callback, sline, scharacter, eline, echaracter) {

        return 0;
    }
    spellCheckAll(document, diagnostics, callback) {
        var startline = 0;
        var endline = Number.MAX_SAFE_INTEGER;

        return this.spellCheckRange(document, callback, startline, void 0, endline, void 0);
    }
}
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = DocumentProcessor;