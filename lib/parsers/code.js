// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017-2019 Bartosz Antosik. Licensed under the MIT License.
// -----------------------------------------------------------------------------

'use strict';

const vscode = require('vscode');

const Parser = require('../parser');
const DocumentTypes = require('../doctype');

class Code extends Parser.default {
    constructor(options) {
        super();
        this.options = options;
    }

    _filter_global(document, text, options) {

        var match;

        // Matching RegExps from settings. They are "spaced out" just except
        // EOL chars so NOT to change the size/geometry of the document.
        for (var i = 0; i < options.ignoreRegExpsMap.length; i++) {
            while (match = options.ignoreRegExpsMap[i].exec(text)) {
                var replace = match[0].replace(/(?:[^\r\n]|\r(?!\n))/g, ' ');
                text = Parser.replaceAt(text, match.index, replace);
            }
        }

        return text;
    }

    _filter_line(document, text, options) {

        var match;

        // Remove URLs
        var re = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/g;
        while (match = re.exec(text)) {
            var replace = ' '.repeat(match[0].length);
            text = Parser.replaceAt(text, match.index, replace);
        }

        // Remove e-mail addresses
        var re = /(mailto:)*(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;
        while (match = re.exec(text)) {
            var replace = ' '.repeat(match[0].length);
            text = Parser.replaceAt(text, match.index, replace);
        }

        if (document.languageId === 'pascal') {
            // Remove compiler directives in comments
            var re = /\{\$.+?\}/gm;
            while (match = re.exec(text)) {
                var replace = ' '.repeat(match[0].length);
                text = Parser.replaceAt(text, match.index, replace);
            }
        }

        if (document.languageId === 'elixir') {
            // Remove compiler directives in comments
            var re = /.*(iex|\.\.\.)>.*/gm;
            while (match = re.exec(text)) {
                var replace = ' '.repeat(match[0].length);
                text = Parser.replaceAt(text, match.index, replace);
            }
        }

        return text;
    }

    _parse(document, diagnostics, options, checkAndMarkCallback, commandCallback, contextCallback, sline, scharacter, eline, echaracter) {

        var text = this._filter_global(document, document.getText(), options);

        var _pos = 0;
        var _linecount = 0;
        var _colcount = 0;
        var _syntax = 0;

        var InBlockComment = false;
        var InLineComment = false;
        var InString = false;
        var InStringMultiline = false;

        var _line_text = '';
        var _line_trace = (-1);

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

        var _rstring = null;
        var _sstring = null;

        var _rstringm = null;
        var _sstringm_m = null;
        var _sstringm = '';

        var _command = SPELLRIGHT_COMMAND;
        var _command_m = _command.exec(text);

        var context = '';

        contextCallback(context);

        if (typeof this.options.comment_line !== 'undefined') {
            _line = new RegExp(this.options.comment_line, 'g');
            _line_m = _line.exec(text);
        }

        if (typeof this.options.comment_start !== 'undefined' &&
            typeof this.options.comment_end !== 'undefined') {
            _start = new RegExp(this.options.comment_start, 'gm');
            _start_m = _start.exec(text);
            _end = new RegExp(this.options.comment_end, 'gm');
            _end_m = _end.exec(text);
        }

        if (typeof this.options.string_inline !== 'undefined' &&
            typeof this.options.string_quote !== 'undefined') {
            _rstring = new RegExp(this.options.string_inline, 'g');
            _sstring = _rstring.exec(text);
        }

        if (typeof this.options.string_multiline !== 'undefined' &&
            typeof this.options.string_quote !== 'undefined') {
            _rstringm = new RegExp(this.options.string_multiline, 'g');
            _sstringm_m = _rstringm.exec(text);
        }

        if (typeof sline === 'undefined')
            sline = 0;
        if (typeof eline === 'undefined')
            eline = Number.MAX_SAFE_INTEGER;

        // Extract areas to spellcheck (body, comments, strings etc.)
        while (_pos < text.length) {

            // Block comment end
            if (_end_m !== null && _pos == _end_m.index) {
                _colcount += _end_m[0].length;
                _pos += _end_m[0].length;
                InBlockComment = false;
                _end.lastIndex = _pos;
                _end_m = _end.exec(text);
                _finish = true;
                _syntax--;
                continue;
            }
            // Block comment start
            if (_start_m !== null && _pos == _start_m.index) {
                if (!InString && !InStringMultiline && !InLineComment && !InBlockComment) {
                    _colcount += _start_m[0].length;
                    _pos += _start_m[0].length;
                    InBlockComment = true;
                    context = 'comments';
                    contextCallback(context);
                    _start.lastIndex = _pos;
                }
                _start_m = _start.exec(text);
                _syntax++;
                continue;
            }

            // Line comment start
            if (_line_m !== null && _pos == _line_m.index) {
                if (!InString && !InStringMultiline && !InLineComment && !InBlockComment) {
                    _colcount += _line_m[0].length;
                    _pos += _line_m[0].length;
                    InLineComment = true;
                    context = 'comments';
                    contextCallback(context);
                    _line.lastIndex = _pos;
                }
                _line_m = _line.exec(text);
                continue;
            }

            if (typeof this.options.string_inline !== 'undefined' &&
                typeof this.options.string_quote !== 'undefined') {

                // Quoted element inside a string
                if (symbol = this.options.string_quote, text[_pos] == symbol) {
                    if (InString && text[_pos + 1] != '\n') {
                        _colcount += 2;
                        _pos += 2;
                        continue;
                    }
                }
                // String start/end
                if (_rstring.test(text[_pos])) {
                    // If multiline string delimiter is extended string
                    // delimiter (e.g. Python " vs. """)
                    if (_sstringm_m !== null && _pos == _sstringm_m.index) {
                        continue;
                    }
                    if (!InString && !InStringMultiline && !InLineComment && !InBlockComment) {
                        _sstring = text[_pos];
                        _colcount += 1;
                        _pos += 1;
                        InString = true;
                        context = 'strings';
                        contextCallback(context);
                        _syntax--;
                        continue;
                    }
                    if (text[_pos] == _sstring && InString) {
                        _colcount += 1;
                        _pos += 1;
                        InString = false;
                        _finish = true;
                        _syntax++;
                        continue;
                    }
                }
            }

            if (typeof this.options.string_multiline !== 'undefined' &&
                typeof this.options.string_quote !== 'undefined') {

                // Quoted element inside a string
                if (symbol = this.options.string_quote, text[_pos] == symbol) {
                    if (InStringMultiline && text[_pos + 1] != '\n') {
                        _colcount += 2;
                        _pos += 2;
                        continue;
                    }
                }
                // Multiline String start/end
                if (_sstringm_m !== null && _pos == _sstringm_m.index) {
                    if (!InString && !InStringMultiline && !InLineComment && !InBlockComment) {
                        _sstringm = _sstringm_m[0];
                        _colcount += _sstringm_m[0].length;
                        _pos += _sstringm_m[0].length;
                        InStringMultiline = true;
                        context = 'strings';
                        contextCallback(context);
                        _syntax--;
                        _sstringm_m = _rstringm.exec(text);
                        continue;
                    }
                    if (InStringMultiline) {
                        if (_sstringm == _sstringm_m[0]) {
                            _colcount += _sstringm_m[0].length;
                            _pos += _sstringm_m[0].length;
                            InStringMultiline = false;
                            _finish = true;
                            _syntax++;
                        }
                        _sstringm_m = _rstringm.exec(text);
                        continue;
                    }
                }
            }

            // Detect commands & pass them up
            if (InLineComment || InBlockComment || _finish) {
                if (_command_m !== null && _pos == _command_m.index) {
                    var _range = new vscode.Range(_linecount, _colcount, _linecount, _colcount + _command_m[0].length);

                    _colcount += _command_m[0].length;
                    _pos += _command_m[0].length;
                    _command.lastIndex = _pos;
                    commandCallback(_command_m[1], _command_m[2].trim());
                    continue;
                }
            }

            while (_line_m !== null && _pos > _line_m.index) {
                _line_m = _line.exec(text);
            }
            while (_command_m !== null && _pos > _command_m.index) {
                _command_m = _command.exec(text);
            }

            if (InLineComment || InBlockComment || InString || InStringMultiline || _finish) {
                if (token == '') {
                    linenumber = _linecount;
                    colnumber = _colcount;
                }

                if (checkAndMarkCallback && sline <= linenumber && linenumber <= eline) {

                    // Extract line, then filter & spell
                    if (_line_trace != _linecount) {
                        var _n_pos = text.indexOf('\n', _pos);
                        if (_n_pos == -1) _n_pos = text.length;
                        if(text[_n_pos - 1] == '\r') {
                            var _line_len = _colcount + _n_pos - _pos - 1;
                        } else {
                            var _line_len = _colcount + _n_pos - _pos;
                        }
                        _line_text = this._filter_line(document, text.substr(_pos - _colcount, _line_len), options);
                        _line_trace = _linecount;
                    }

                    // Build lexem to check
                    if (_line_text[_colcount] && SPELLRIGHT_LEXEM_BUILD.test(_line_text[_colcount]) && !_finish) {
                        token += _line_text[_colcount];
                    }

                    // Check spelling & tag diagnostics
                    if (token && (SPELLRIGHT_LEXEM_SPELL.test(_line_text[_colcount]) || _finish || _colcount == _line_text.length - 1)) {

                        if (typeof echaracter !== 'undefined') {
                            // Here skip spelling token (word) currently being changed
                            if (echaracter != colnumber + (token.length - 1)) {
                                if (typeof checkAndMarkCallback === "function")
                                    checkAndMarkCallback(document, context, diagnostics, { word: token, parser: 'code' }, linenumber, colnumber);
                            }
                        } else {
                            if (typeof checkAndMarkCallback === "function")
                                checkAndMarkCallback(document, context, diagnostics, { word: token, parser: 'code' }, linenumber, colnumber);
                        }
                        token = '';
                    }
                    if (_finish) {
                        context = '';
                        contextCallback(context);
                    }
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
        return { syntax: _syntax, linecount: _linecount };
    }
}
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = Code;
