// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017 Bartosz Antosik. Licensed under the MIT License.
// -----------------------------------------------------------------------------

'use strict';

const Parser = require('../parser');
const DocumentTypes = require('../doctype');

class Plaintext extends Parser.default {

    spellCheckRange(document, diagnostics, checkAndMark, sline, scharacter, eline, echaracter) {
        return 0;
    }
}
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = Plaintext;
