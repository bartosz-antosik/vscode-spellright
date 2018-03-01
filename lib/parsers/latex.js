// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017-2018 Bartosz Antosik. Licensed under the MIT License.
// -----------------------------------------------------------------------------

'use strict';

const vscode = require('vscode');

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

    _filter(document, text, options) {

        var match;

        // Matching RegExps from settings. They are "spaced out" just except
        // EOL chars so NOT to change the size/geometry of the document.
        for (var i = 0; i < options.ignoreRegExpsMap.length; i++) {
            while (match = options.ignoreRegExpsMap[i].exec(text)) {
                var replace = match[0].replace(/(?:[^\r\n]|\r(?!\n))/g, ' ');
                text = text.replaceAt(match.index, replace);
            }
        }

        // Space out commands that should have parameter list spell checked.
        for (var i = 0; i < options.latexSpellParameters.length; i++) {
            var re = new RegExp('\\\\' + options.latexSpellParameters[i] + '\\b', 'g');
            while (match = re.exec(text)) {
                var replace = match[0].replace(/(?:[^\r\n]|\r(?!\n))/g, ' ');
                text = text.replaceAt(match.index, replace);
            }
        }

        // Remove commands
        var re = /\\\w+\*?[\s]*([\s]*(\{(?:\{[^\}]*\}|[^\{\}])*\})|[\s]*(\[(?:\[[^\]]*\]|[^\[\]])*\]))*/g;
        while (match = re.exec(text)) {
            var replace = match[0].replace(/(?:[^\r\n]|\r(?!\n))/g, ' ');
            text = text.replaceAt(match.index, replace);
        }

        // Remove math
        var re = /(\$|\\\(|\\\[).+?(\$|\\\)|\\\])/g;
        var match;
        while (match = re.exec(text)) {
            var replace = ' '.repeat(match[0].length);
            text = text.replaceAt(match.index, replace);
        }

        // Remove magic comments
        var re = /\!TEX.*/gi;
        var match;
        while (match = re.exec(text)) {
            var replace = ' '.repeat(match[0].length);
            text = text.replaceAt(match.index, replace);
        }

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

        return text;
    }

    _parse(document, diagnostics, options, checkAndMark, interpretCommand, sline, scharacter, eline, echaracter) {

        var text = this._filter(document, document.getText(), options);

        var _pos = 0;
        var _linecount = 0;
        var _colcount = 0;
        var _syntax = 0;

        var InLineComment = false;
        var InContent = true;

        var symbol;

        var token = '';
        var linenumber = 0;
        var colnumber = 0;

        var _line = null;
        var _line_m = null;

        var _command = COMMAND;
        var _command_m = _command.exec(text);

        var _command_tex = COMMAND_TEX;
        var _command_tex_m = _command_tex.exec(text);

        var context = 'body';

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
                    context = 'comments';
                    _line.lastIndex = _pos;
                }
                _line_m = _line.exec(text);
                continue;
            }

            // Detect commands & pass them up
            if (InLineComment) {
                if (_command_m !== null && _pos == _command_m.index) {
                    var _range = new vscode.Range(_linecount, _colcount, _linecount, _colcount + _command_m[0].length);

                    _colcount += _command_m[0].length;
                    _pos += _command_m[0].length;
                    _command.lastIndex = _pos;

                    interpretCommand(_command_m[1], _command_m[3], _range);

                    _command_m = _command.exec(text);
                    continue;
                }
                if (_command_tex_m !== null && _pos == _command_tex_m.index) {
                    var _range = new vscode.Range(_linecount, _colcount, _linecount, _colcount + _command_tex_m[0].length);

                    _colcount += _command_tex_m[0].length;
                    _pos += _command_tex_m[0].length;
                    _command_tex.lastIndex = _pos;

                    interpretCommand('language', _command_tex_m[1], _range);

                    _command_tex_m = _command_tex.exec(text);
                    continue;
                }
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
            }

            // Line end - finish token, string & line comment etc. Should be
            // fine for either LF or CRLF combination that VSCode supports.
            if (text[_pos] === '\n') {
                _linecount++;
                _colcount = 0;
                if (InLineComment) {
                    InLineComment = false;
                    context = 'body';
                }
            } else {
                _colcount++;
            }
            _pos++;
        }
        return { syntax: _syntax, linecount: _linecount };
    }
}
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = LaTeX;
