// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017 Bartosz Antosik. Licensed under the MIT License.
// -----------------------------------------------------------------------------

'use strict';

const Parser = require('../parser');
const DocumentTypes = require('../doctype');

class Plaintext extends Parser.default {

    filterText(document, text) {

        var re = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/g;
        var match;
        while (match = re.exec(text)) {
            var replace = ' '.repeat(match[0].length);
            text = text.replaceAt(match.index, replace);
        }

        return text;
    }

    spellCheckRange(document, diagnostics, checkAndMark, sline, scharacter, eline, echaracter) {

        var text = this.filterText(document, document.getText());

        var _pos = 0;
        var _linecount = 0;
        var _colcount = 0;

        var InContent = true;

        var symbol;

        var token = '';
        var linenumber = 0;
        var colnumber = 0;

        if (typeof sline === 'undefined')
            sline = 0;
        if (typeof eline === 'undefined')
            eline = Number.MAX_SAFE_INTEGER;

        // Extract areas to spellcheck (body, comments, strings etc.)
        while (_pos < text.length) {

            if (InContent) {
                // Build lexem to check
                if (LEXEM_BUILD.test(text[_pos])) {
                    if (token == '') {
                        linenumber = _linecount;
                        colnumber = _colcount;
                    }
                    token += text[_pos];
                }
                // Check spelling & tag diagnostics
                // punctuation: .,\/#!$%\^&\*;:{}=\-_`~()
                if (token && (LEXEM_SPELL.test(text[_pos]) || _pos == (text.length - 1))) {
                    if (sline <= linenumber && linenumber <= eline)
                        if (typeof echaracter !== 'undefined') {
                            if (echaracter < colnumber || echaracter >= colnumber + token.length) {
                                checkAndMark(diagnostics, token, linenumber, colnumber);
                            }
                        } else {
                            checkAndMark(diagnostics, token, linenumber, colnumber);
                        }
                    token = '';
                }
            }

            // Line end - finish token, block & line comment etc. Should be
            // fine for either LF or CRLF combination that VSCode supports.
            if (text[_pos] === '\n') {
                _linecount++;
                _colcount = 0;
            } else {
                _colcount++;
            }
            _pos++;
        }
    }
}
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = Plaintext;
