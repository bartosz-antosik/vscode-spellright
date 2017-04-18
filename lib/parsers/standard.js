// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017 Bartosz Antosik. Licensed under the MIT License.
// -----------------------------------------------------------------------------

'use strict';

const Parser = require('../parser');
const DocumentTypes = require('../doctype');

class Standard extends Parser.default {
    constructor(options) {
        super();
        this.options = options;
    }
    spellCheckRange(document, diagnostics, checkAndMark, sline, scharacter, eline, echaracter) {

        var text = document.getText();

        var _pos = 0;
        var _linecount = 0;
        var _colcount = 0;

        var InBlockComment = false;
        var InLineComment = false;
        var InString = false;

        var symbol;

        var token = '';
        var linenumber = 0;
        var colnumber = 0;

        var _finish = false;

        var _line = null;
        var _line_m = null;
        var _start = null;
        var _start_m = null;
        var _end = null;
        var _end_m = null;

        if (typeof this.options.line !== 'undefined') {
            _line = new RegExp(this.options.line, 'g');
            _line_m = _line.exec(text);
        }

        if (typeof this.options.start !== 'undefined' &&
            typeof this.options.end !== 'undefined') {
            _start = new RegExp(this.options.start, 'g');
            _start_m = _start.exec(text);
            _end = new RegExp(this.options.end, 'g');
            _end_m = _end.exec(text);
        }

        if (typeof this.options.string !== 'undefined' &&
            typeof this.options.quote !== 'undefined') {
            var _rstring = new RegExp(this.options.string, 'g');
            var _sstring;
        }

        if (typeof sline === 'undefined')
            sline = 0;
        if (typeof eline === 'undefined')
            eline = Number.MAX_SAFE_INTEGER;

        // Extract areas to spellcheck (body, comments, strings etc.)
        while (_pos < text.length) {

            // Line comment start
            if (_line_m !== null && _pos == _line_m.index) {
                if (!InString && !InLineComment && !InBlockComment) {
                    _colcount += _line_m[0].length;
                    _pos += _line_m[0].length;
                    InLineComment = true;
                    _line.lastIndex = _pos;
                }
                _line_m = _line.exec(text);
                continue;
            }

            // Block comment end
            if (_end_m !== null && _pos == _end_m.index) {
                _colcount += _end_m[0].length;
                _pos += _end_m[0].length;
                InBlockComment = false;
                _end.lastIndex = _pos;
                _end_m = _end.exec(text);
                _finish = true;
                continue;
            }
            // Block comment start
            if (_start_m !== null && _pos == _start_m.index) {
                if (!InString && !InLineComment && !InBlockComment) {
                    _colcount += _start_m[0].length;
                    _pos += _start_m[0].length;
                    InBlockComment = true;
                    _start.lastIndex = _pos;
                }
                _start_m = _start.exec(text);
                continue;
            }

            if (typeof this.options.string !== 'undefined' &&
                typeof this.options.quote !== 'undefined') {

                // Quoted element inside a string
                if (symbol = this.options.quote, text[_pos] == symbol) {
                    if (InString) {
                        _colcount += 2;
                        _pos += 2;
                        continue;
                    }
                }
                // String start/end
                if (_rstring.test(text[_pos])) {
                    if (!InString && !InLineComment && !InBlockComment) {
                        _sstring = text[_pos];
                        _colcount += 1;
                        _pos += 1;
                        InString = true;
                        continue;
                    }
                    if (text[_pos] == _sstring && InString) {
                        _colcount += 1;
                        _pos += 1;
                        InString = false;
                        _finish = true;
                        continue;
                    }
                }
            }

            if (InLineComment || InBlockComment || InString || _finish) {
                // Build lexem to check
                if (LEXEM_BUILD.test(text[_pos]) && !_finish) {
                    if (token == '') {
                        linenumber = _linecount;
                        colnumber = _colcount;
                    }
                    token += text[_pos];
                }
                // Check spelling & tag diagnostics
                if (token && (LEXEM_SPELL.test(text[_pos]) || _finish || _pos == (text.length - 1))) {
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
                _finish = false;
            }

            // Line end - finish token, string & line comment etc. Should be
            // fine for either LF or CRLF combination that VSCode supports.
            if (text[_pos] === '\n') {
                _linecount++;
                _colcount = 0;
                if (InLineComment) InLineComment = false;
                if (InString) InString = false;
            } else {
                _colcount++;
            }
            _pos++;
        }
    }
}
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = Standard;
