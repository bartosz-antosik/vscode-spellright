// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017-2018 Bartosz Antosik. Licensed under the MIT License.
// -----------------------------------------------------------------------------

'use strict';

const vscode = require('vscode');

const Parser = require('../parser');
const DocumentTypes = require('../doctype');

class Plaintext extends Parser.default {

    _parse(document, diagnostics, options, checkAndMark, interpretCommand, sline, scharacter, eline, echaracter) {
        return { syntax: 0, linecount: 0 };
    }
}
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = Plaintext;
