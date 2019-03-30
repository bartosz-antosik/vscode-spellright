// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017-2019 Bartosz Antosik. Licensed under the MIT License.
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

    _filter_global(document, text, options) {

        var match;

        // Matching RegExps from settings. They are "spaced out" just except
        // EOL chars so NOT to change the size/geometry of the document.
        for (var i = 0; i < options.ignoreRegExpsMap.length; i++) {
            while (match = options.ignoreRegExpsMap[i].exec(text)) {
                var replace = match[0].replace(/(?:[^\r\n]|\r(?!\n))/g, '_');
                text = Parser.replaceAt(text, match.index, replace);
            }
        }

        // Remove links from inside []() construct
        var re = /(\[.*\])(\(.*\))/g;
        while (match = re.exec(text)) {
            var replace = '_'.repeat(match[2].length);
            text = Parser.replaceAt(text, match.index + match[1].length, replace);
        }

        // Remove XML/HTML tags
        var re = /<[\w\/][^>]+>/g;
        while (match = re.exec(text)) {
            // Check whether not inside comment, if so, leave.
            var ce = /<!--[^>]*-->/g;
            var cmatch;
            var inside = false;
            while (cmatch = ce.exec(text)) {
                if (match.index >= cmatch.index && (match.index + match[0].length) <= (cmatch.index + cmatch[0].length)) {
                    inside = true;
                    break;
                }
            }
            if (!inside) {
                var replace = match[0].replace(/(?:[^\r\n]|\r(?!\n))/g, '_');
                text = Parser.replaceAt(text, match.index, replace);
            }
        }

        if (document.languageId === 'troff') {
        }

        if (document.languageId === 'asciidoc') {
            // Attributes (:name: value) except some (e.g. :summary:)
            var re = /^:(\w[\w\d]*):.*$/gm;
            while (match = re.exec(text)) {
                if (match[1] !== 'summary') {
                    var replace = '_'.repeat(match[0].length);
                    text = Parser.replaceAt(text, match.index, replace);
                }
            }
            // Options ([...])
            var re = /^\[.*\]$/gm;
            while (match = re.exec(text)) {
                var replace = '_'.repeat(match[0].length);
                text = Parser.replaceAt(text, match.index, replace);
            }
        }

        if (document.languageId === 'restructuredtext') {
            // Remove reStructuredText directives relative to code blocks
            // with this RegExp: https://regex101.com/r/GJXToz/2
            var re = /^\.\. (code-block|highlight).*($\s{4,}.*)*/gm;
            while (match = re.exec(text)) {
                var replace = match[0].replace(/(?:[^\r\n]|\r(?!\n))/g, '_');
                text = Parser.replaceAt(text, match.index, replace);
            }
        }

        return text;
    }

    _filter_line(document, text, options) {

        var match;

        // Remove inline code sections
        var re = /`[^\n`]+`/g;
        while (match = re.exec(text)) {
            var replace = '_'.repeat(match[0].length);
            text = Parser.replaceAt(text, match.index, replace);
        }

        // Remove URLs
        var re = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/g;
        while (match = re.exec(text)) {
            var replace = '_'.repeat(match[0].length);
            text = Parser.replaceAt(text, match.index, replace);
        }

        // Remove e-mail addresses
        var re = /(mailto:)*(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;
        while (match = re.exec(text)) {
            var replace = '_'.repeat(match[0].length);
            text = Parser.replaceAt(text, match.index, replace);
        }

        return text;
    }

    _parse(document, diagnostics, options, checkAndMarkCallback, commandCallback, contextCallback, sline, scharacter, eline, echaracter) {

        var text = this._filter_global(document, document.getText(), options);

        var _pos = 0;
        var _linecount = 0;
        var _colcount = 0;
        var _syntax = 0;

        var InContent = true;
        var InCode = false;
        var InLineCode = false;

        var _line_text = '';
        var _line_trace = (-1);

        var token = '';
        var linenumber = 0;
        var colnumber = 0;

        var _code;
        var _code_m = null;
        var _code_line;
        var _code_line_m = null;

        var context = 'body';

        contextCallback(context);

        // Markdown code block start/end
        if (typeof this.options.code_start !== 'undefined') {
            _code = new RegExp(this.options.code_start, 'g');
            _code_m = _code.exec(text);
        }

        if (typeof this.options.code_line !== 'undefined') {
            _code_line = new RegExp(this.options.code_line, 'gm');
            _code_line_m = _code_line.exec(text);
        }

        var _last_empty_line = (-1);
        var _empty_line = /\n\s*\n/gm;
        var _empty_line_m = _empty_line.exec(text);

        var _command = SPELLRIGHT_COMMAND;
        var _command_m = _command.exec(text);

        if (typeof sline === 'undefined')
            sline = 0;
        if (typeof eline === 'undefined')
            eline = Number.MAX_SAFE_INTEGER;

        // Extract areas to spellcheck (body, comments, strings etc.)
        while (_pos < text.length) {

            // Code block start
            if (_code_m !== null && _pos == _code_m.index) {
                if (InContent) {
                    _colcount += _code_m[0].length;
                    _pos += _code_m[0].length;
                    InContent = false;
                    InCode = true;
                    context = 'code';
                    contextCallback(context);
                    _code.lastIndex = _pos;
                    _code_m = _code.exec(text);
                    _syntax++;
                    continue;
                }
                if (!InContent) {
                    _colcount += _code_m[0].length;
                    _pos += _code_m[0].length;
                    InContent = true;
                    InCode = false;
                    context = 'body';
                    contextCallback(context);
                    _code.lastIndex = _pos;
                    _code_m = _code.exec(text);
                    _syntax--;
                    continue;
                }
            }

            // Indented code block start
            if (_code_line_m !== null && _pos == _code_line_m.index) {
                if (InContent && _last_empty_line == (_linecount - 1)) {
                    _colcount += _code_line_m[0].length;
                    _pos += _code_line_m[0].length;
                    InContent = false;
                    InLineCode = true;
                    context = 'code';
                    contextCallback(context);
                    _code_line.lastIndex = _pos;
                    // Below is a trick which drags codeblock across lines
                    _last_empty_line = _linecount;
                }
                _code_line_m = _code_line.exec(text);
                continue;
            }

            // Detect commands & pass them up
            if (InContent) {
                if (_command_m !== null && _pos == _command_m.index) {
                    var _range = new vscode.Range(_linecount, _colcount, _linecount, _colcount + _command_m[0].length);

                    _colcount += _command_m[0].length;
                    _pos += _command_m[0].length;
                    _command.lastIndex = _pos;

                    commandCallback(_command_m[1], _command_m[2].trim());

                    _command_m = _command.exec(text);
                    continue;
                }
            }

            if (InContent || InCode || InLineCode) {
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
                    if (_line_text[_colcount] && SPELLRIGHT_LEXEM_BUILD.test(_line_text[_colcount])) {
                        token += _line_text[_colcount];
                    }

                    // Check spelling & tag diagnostics
                    if (token && (SPELLRIGHT_LEXEM_SPELL.test(_line_text[_colcount]) || _colcount == _line_text.length - 1)) {

                        if (typeof echaracter !== 'undefined') {
                            // Here skip spelling token (word) currently being changed
                            if (echaracter != colnumber + (token.length - 1)) {
                                checkAndMarkCallback(document, context, diagnostics, { word: token, parser: 'markdown' }, linenumber, colnumber);
                            }
                        } else {
                            checkAndMarkCallback(document, context, diagnostics, { word: token, parser: 'markdown' }, linenumber, colnumber);
                        }

                        token = '';
                    }
                }
            }

            // Register last empty line encountered
            if (_empty_line_m !== null && _pos == _empty_line_m.index) {
                _last_empty_line = _linecount + 1;
                _empty_line.lastIndex++;
                _empty_line_m = _empty_line.exec(text);
            }

            // Line end - finish token, block & line comment etc. Should be
            // fine for either LF or CRLF combination that VSCode supports.
            if (text[_pos] === '\n') {
                _linecount++;
                _colcount = 0;
                if (InLineCode) {
                    InLineCode = false;
                    InContent = true;
                    context = 'body';
                    contextCallback(context);
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
exports.default = Markdown;
