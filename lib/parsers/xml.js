// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017 Bartosz Antosik. Licensed under the MIT License.
// -----------------------------------------------------------------------------

'use strict';

const vscode = require('vscode');

const Parser = require('../parser');
const DocumentTypes = require('../doctype');

class Xml extends Parser.default {
    constructor(options) {
        super(...arguments);
        this.options = {
            start: '<!--',
            end: '-->'
        };
        if (typeof options.start !== 'undefined')
            this.options.start = options.start;
        if (typeof options.end !== 'undefined')
            this.options.end = options.end;
    }

    _filter(document, text) {

        var match;
        var re = /\&.+;/g;
        while (match = re.exec(text)) {
            var replace = ' '.repeat(match[0].length);
            text = text.replaceAt(match.index, replace);
        }

        return text;
    }

    _parse(document, diagnostics, checkAndMark, interpretCommand, sline, scharacter, eline, echaracter) {

        var text = this._filter(document, document.getText());

        var _pos = 0;
        var _linecount = 0;
        var _colcount = 0;
        var _syntax = 0;

        var InBlockComment = false;
        var InContent = true;

        var symbol;

        var token = '';
        var linenumber = 0;
        var colnumber = 0;

        var _finish = false;

        var _start = null;
        var _start_m = null;
        var _end = null;
        var _end_m = null;

        var _command = COMMAND;
        var _command_m = _command.exec(text);

        var context = '';

        if (typeof this.options.start !== 'undefined' &&
            typeof this.options.end !== 'undefined') {
            _start = new RegExp(this.options.start, 'g');
            _start_m = _start.exec(text);
            _end = new RegExp(this.options.end, 'g');
            _end_m = _end.exec(text);
        }

        if (typeof sline === 'undefined')
            sline = 0;
        if (typeof eline === 'undefined')
            eline = Number.MAX_SAFE_INTEGER;

        // Extract areas to spellcheck (body, comments, strings etc.)
        while (_pos < text.length) {
            if (text[_pos] === '\n') {
                _linecount++;
                _colcount = 0;
                _pos++;
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
                if (!InBlockComment) {
                    _colcount += _start_m[0].length;
                    _pos += _start_m[0].length;
                    InBlockComment = true;
                    _start.lastIndex = _pos;
                }
                _start_m = _start.exec(text);
                continue;
            }

            // XML tag stop
            if (text[_pos] === '>') {
                _colcount += 1;
                _pos += 1;
                 InContent = true;
                 continue;
            }
            // XML tag start
            if (text[_pos] === '<' && !InBlockComment) {
                _colcount += 1;
                _pos += 1;
                _finish = true;
                 InContent = false;
                 continue;
            }

            // Detect commands & pass them up
            if (InBlockComment || _finish) {
                if (_command_m !== null && _pos == _command_m.index) {
                    var _range = new vscode.Range(_linecount, _colcount, _linecount, _colcount + _command_m[0].length);

                    _colcount += _command_m[0].length;
                    _pos += _command_m[0].length;
                    _command.lastIndex = _pos;

                    interpretCommand(_command_m[1], _command_m[3], _range);

                    _command_m = _command.exec(text);
                    continue;
                }
            }

            if (InBlockComment || InContent || _finish) {
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

                    if (InBlockComment) {
                        context = 'comment';
                    } else if (InContent) {
                        context = 'body';
                    } else {
                        context = '';
                    }

                    // Check spelling
                    if (sline <= linenumber && linenumber <= eline) {
                        if (typeof echaracter !== 'undefined') {
                            // Here skip spelling token (word) currently being changed
                            if (echaracter != colnumber + (token.length - 1)) {
                                checkAndMark(document, context, diagnostics, token, linenumber, colnumber);
                            }
                        } else {
                            checkAndMark(document, context, diagnostics, token, linenumber, colnumber);
                        }
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
            } else {
                _colcount++;
            }
            _pos++;
        }
        return { syntax: _syntax, linecount: _linecount };
    }
}
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = Xml;
