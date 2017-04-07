// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017 Bartosz Antosik. MIT license.
// -----------------------------------------------------------------------------

'use strict';

const Parser = require('../parser');
const DocumentTypes = require('../doctype');

class LaTeX extends Parser.default {
    constructor() {
        super(...arguments);
        this.options = {
            start: null,
            end: null,
            line: '%'
        };
    }

    filterText(document, text) {

        var re = /\\\w+(\[.*?\])*(\{.*?\})*(\[.*?\])*/g;
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

        var InLineComment = false;
        var InContent = true;

        var symbol;

        var token = '';
        var linenumber = 0;
        var colnumber = 0;

        var _line = null;
        var _line_m = null;

        if (typeof this.options.line !== 'undefined') {
            _line = new RegExp(this.options.line, 'g');
            _line_m = _line.exec(text);
        }

        if (typeof sline === 'undefined')
            sline = 0;
        if (typeof eline === 'undefined')
            eline = Number.MAX_SAFE_INTEGER;

        // Extract areas to spellcheck (body, comments, strings etc.)
        while (_pos < text.length) {

            // Line comment start
            if (_line_m !== null && _pos == _line_m.index) {
                if (!InLineComment) {
                    _colcount += _line_m[0].length;
                    _pos += _line_m[0].length;
                    InLineComment = true;
                    _line.lastIndex = _pos;
                }
                _line_m = _line.exec(text);
                continue;
            }

            if (InLineComment || InContent) {
                // Build lexem to check
                if (LEXEM_BUILD.test(text[_pos])) {
                    if (token == '') {
                        linenumber = _linecount;
                        colnumber = _colcount;
                    }
                    token += text[_pos];
                }

                // Check spelling & tag diagnostics
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

            // Line end - finish token, string & line comment etc. Should be
            // fine for either LF or CRLF combination that VSCode supports.
            if (text[_pos] === '\n') {
                _linecount++;
                _colcount = 0;
                if (InLineComment) InLineComment = false;
            } else {
                _colcount++;
            }
            _pos++;
        }
    }
}
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = LaTeX;
