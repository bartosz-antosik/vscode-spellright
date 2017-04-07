// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017 Bartosz Antosik. MIT license.
// -----------------------------------------------------------------------------

'use strict';

const Parser = require('../parser');
const DocumentTypes = require('../doctype');

class Plaintext extends Parser.default {

    spellCheckRange(document, diagnostics, checkAndMark, sline, scharacter, eline, echaracter) {

    }
}
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = Plaintext;
