// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017-2021 Bartosz Antosik. Licensed under the MIT License.
// -----------------------------------------------------------------------------

'use strict';

const Parser = require('../parser');

class ParserBase extends Parser.default {

    /**
     *
     * @param {*} token
     * @param {int} tokenStart token start positon (character)
     * @param {int} pos0 range start position (character)
     * @param {int} pos1 range end position (character, inclusive)
     * @returns whether the given token at the given position intersects w/ the given range
     */
    isCheckAndMark = function(token, tokenStart, pos0, pos1) {
        var tokenEnd = tokenStart + token.length; // exclusive
        // TODO add? typeof checkAndMarkCallback === "function" &&
        var result = (!pos0 || pos0 <= tokenEnd) // '<=' = recheck on separator/whitespace add or last char delete
                && (!pos1 || tokenStart <= pos1);
        if (SPELLRIGHT_DEBUG_OUTPUT && (pos0 || pos1) && result) {
            console.log("[spellright] isCheckAndMark: " + token + " [" + tokenStart + "," + tokenEnd + "), start=" + pos0 + ", end=" + pos1 + " -- result=" + result);
        }
        return result;
    }
}

Object.defineProperty(exports, '__esModule', { value: true });
exports.default = ParserBase;
