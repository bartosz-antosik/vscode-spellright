// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017 Bartosz Antosik. Licensed under the MIT License.
// -----------------------------------------------------------------------------

'use strict';

const vscode = require('vscode');

const Parser = require('../parser');
const DocumentTypes = require('../doctype');

class Markdown extends Parser.default {
    constructor(options) {
        super();
        this.options = options;
    }

    _filter(document, text) {

        var match;
        // Remove URLs
        var re = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/g;
        while (match = re.exec(text)) {
            var replace = ' '.repeat(match[0].length);
            text = text.replaceAt(match.index, replace);
        }

        // Remove e-mail addresses
        re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;
        while (match = re.exec(text)) {
            var replace = ' '.repeat(match[0].length);
            text = text.replaceAt(match.index, replace);
        }

        // Remove inline code sections
        re = /`[^\n`]+`/g;
        while (match = re.exec(text)) {
            var replace = ' '.repeat(match[0].length);
            text = text.replaceAt(match.index, replace);
        }

        // Remove links from inside []() construct
        re = /(\[.*\])(\(.*\))/g;
        while (match = re.exec(text)) {
            var replace = ' '.repeat(match[2].length);
            text = text.replaceAt(match.index + match[1].length, replace);
        }

        if (document.languageId === 'troff') {
        }

        if (document.languageId === 'restructuredtext') {
            // Remove reStructuredText directives relative to code blocks
            // with this RegExp: https://regex101.com/r/GJXToz/2
            re = /^\.\. (code-block|highlight).*($\s{4,}.*)*/gm;
            while (match = re.exec(text)) {
                var replace = match[0].replace(/(?:[^\r\n]|\r(?!\n))/g, ' ');
                text = text.replaceAt(match.index, replace);
            }
        }

        return text;
    }

    _parse(document, diagnostics, checkAndMark, interpretCommand, sline, scharacter, eline, echaracter) {

        var text = this._filter(document, document.getText());

        var _pos = 0;
        var _linecount = 0;
        var _colcount = 0;
        var _syntax = 0;

        var InContent = true;

        var symbol;

        var token = '';
        var linenumber = 0;
        var colnumber = 0;

        var _code;
        var _code_m;

        var context = '';

        // Markdown code block start/end
        if (typeof this.options.code_start !== 'undefined') {
            _code = new RegExp(this.options.code_start, 'g');
            _code_m = _code.exec(text);
        }

        var _command = COMMAND;
        var _command_m = _command.exec(text);

        if (typeof sline === 'undefined')
            sline = 0;
        if (typeof eline === 'undefined')
            eline = Number.MAX_SAFE_INTEGER;

        // Extract areas to spellcheck (body, comments, strings etc.)
        while (_pos < text.length) {

            // Code section start
            if (_code_m !== null && _pos == _code_m.index) {
                if (InContent) {
                    _colcount += _code_m[0].length;
                    _pos += _code_m[0].length;
                    InContent = false;
                    _code.lastIndex = _pos;
                    _code_m = _code.exec(text);
                    _syntax++;
                    continue;
                }
                if (!InContent) {
                    _colcount += _code_m[0].length;
                    _pos += _code_m[0].length;
                    InContent = true;
                    _code.lastIndex = _pos;
                    _code_m = _code.exec(text);
                    _syntax--;
                    continue;
                }
            }

            // Detect commands & pass them up
            if (InContent) {
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
                if (token && (LEXEM_SPELL.test(text[_pos]) || _pos == (text.length - 1))) {

                    context = 'body';

                    if (sline <= linenumber && linenumber <= eline) {
                        if (typeof echaracter !== 'undefined') {
                            // Here skip spelling token (word) currently being changed
                            if (echaracter != colnumber + (token.length - 1)) {
                                checkAndMark(context, diagnostics, token, linenumber, colnumber);
                            }
                        } else {
                            checkAndMark(context, diagnostics, token, linenumber, colnumber);
                        }
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
        return { syntax: _syntax, linecount: _linecount };
    }
}
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = Markdown;
