// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017-2019 Bartosz Antosik. Licensed under the MIT License.
// -----------------------------------------------------------------------------

'use strict';

const vscode = require('vscode');

const Parser = require('../parser');
const DocumentTypes = require('../doctype');

const ESCAPE_COMBINE = {
    "\\\`": '\u0300',
    '\\\'': '\u0301',
    '\\\^': '\u0302',
    '\\\"': '\u0308',
    '\\H': '\u030B',
    '\\\~': '\u0303',
    '\\c': '\u0327',
    '\\k': '\u0328',
    '\\\=': '\u035e',
    '\\b': '\u0329',
    '\\\.': '\u0307',
    '\\d': '\u0323',
    '\\r': '\u030a',
    '\\u': '\u0306',
    '\\v': '\u030c'
};

const ESCAPE_COMMANDS = [
    'H',
    'c',
    'k',
    'l',
    'L',
    'b',
    'd',
    'r',
    'u',
    'v',
    't',
    'o',
    'O',
    'i',
    'j',
    'aa',
    'AA'
];

class LaTeX extends Parser.default {
    constructor() {
        super(...arguments);
        this.options = {
            start: null,
            end: null,
            line: '%'
        };
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

        // Remove commands
        var re = /\\((\w+)\*?[\s]*([\s]*(\{(?:\{[^\}]*\}|[^\{\}])*\})|[\s]*(\[(?:\[[^\]]*\]|[^\[\]])*\])|[\s]*(\<(?:\<[^>]]*\>|[^\<\>])*\>))*|\\)/g;
        while (match = re.exec(text)) {
            if (ESCAPE_COMMANDS.indexOf(match[2]) > -1) continue;

            var commandToSpell = false;
            outer_loop:
            for (var i = 0; i < options.latexSpellParameters.length; i++) {
                if (options.latexSpellParameters[i].test(match[2])) {
                    var replace = ' '.repeat(match[2].length);
                    text = Parser.replaceAt(text, match.index + 1, replace);
                    // Restart search from just after the command (commands
                    // embedded within commands).
                    re.lastIndex = match.index + match[2].length + 1;
                    commandToSpell = true;
                    break outer_loop;
                }
            }
            if (!commandToSpell) {
                var replace = match[0].replace(/(?:[^\r\n]|\r(?!\n))/g, ' ');
                text = Parser.replaceAt(text, match.index, replace);
            }
        }

        // Remove math
        var re = /(\$|\\\(|\\\[).+?(\$|\\\)|\\\])/g;
        var match;
        while (match = re.exec(text)) {
            var replace = ' '.repeat(match[0].length);
            text = Parser.replaceAt(text, match.index, replace);
        }

        return text;
    }

    _filter_line(document, text, options) {

        var match;

        // Remove magic comments
        var re = /\!(TEX|BIB).*/gi;
        var match;
        while (match = re.exec(text)) {

            // Skip magic comment(s) serviced by the extension
            var _command_tex = SPELLRIGHT_COMMAND_TEX;
            var _command_tex_m = _command_tex.exec(text);
            if (_command_tex_m && match.index != _command_tex_m) continue;

            var replace = ' '.repeat(match[0].length);
            text = Parser.replaceAt(text, match.index, replace);
        }

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

        return text;
    }

    _parse(document, diagnostics, options, checkAndMarkCallback, commandCallback, contextCallback, sline, scharacter, eline, echaracter) {

        var text = this._filter_global(document, document.getText(), options);

        var _pos = 0;
        var _linecount = 0;
        var _colcount = 0;
        var _syntax = 0;

        var InLineComment = false;
        var InContent = true;

        var _line_text = '';
        var _line_trace = (-1);

        var token = '';
        var extoken = '';
        var charmap = [];
        var linenumber = 0;
        var colnumber = 0;

        var _line = null;
        var _line_m = null;

        var _command = SPELLRIGHT_COMMAND;
        var _command_m = _command.exec(text);

        var _command_tex = SPELLRIGHT_COMMAND_TEX;
        _command_tex.lastIndex = 0;
        var _command_tex_m = _command_tex.exec(text);

        var context = 'body';

        contextCallback(context);

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
                    contextCallback(context);
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

                    commandCallback(_command_m[1], _command_m[2].trim());

                    _command_m = _command.exec(text);
                    continue;
                }
                if (_command_tex_m !== null && _pos == _command_tex_m.index) {
                    var _range = new vscode.Range(_linecount, _colcount, _linecount, _colcount + _command_tex_m[0].length);

                    _colcount += _command_tex_m[0].length;
                    _pos += _command_tex_m[0].length;
                    _command_tex.lastIndex = _pos;

                    commandCallback('language', _command_tex_m[1]);

                    _command_tex_m = _command_tex.exec(text);
                    continue;
                }
            }

            if (InLineComment || InContent) {
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

                    // Detect & collect LaTeX escape sequences (\"{o}, \'{a}, etc.)
                    while (_line_text[_colcount] === '\\') {
                        var _escape;
                        // General rule for most COMBINED characters
                        _escape = /(\\[\`\'\^\"\~\=\.Hckbdruv])(\{)(\w)(\})/g;
                        _escape.lastIndex = _colcount;
                        var _escape_m = _escape.exec(_line_text);
                        if (_escape_m != null && _escape_m.index == _colcount) {
                            token += _escape_m[0];
                            extoken += _escape_m[3] + ESCAPE_COMBINE[_escape_m[1]];
                            extoken = extoken.normalize('NFC');
                            // Correct pointers with "eaten" characters
                            _pos += _escape_m[0].length;
                            _colcount += _escape_m[0].length;
                            charmap.push(_escape_m[0]);
                            continue;
                        }
                        // Handpick "BARRED L"
                        _escape = /(\\[lL])(\{\})/g;
                        _escape.lastIndex = _colcount;
                        var _escape_m = _escape.exec(_line_text);
                        if (_escape_m != null && _escape_m.index == _colcount) {
                            switch (_escape_m[1]) {
                                case '\\l':
                                    extoken += 'ł';
                                    break;
                                case '\\L':
                                    extoken += 'Ł';
                                    break;
                            }
                            token += _escape_m[0];
                            _pos += _escape_m[0].length;
                            _colcount += _escape_m[0].length;
                            charmap.push(_escape_m[0]);
                            continue;
                        }
                        // Handpick "SLASHED O"
                        _escape = /(\\[oO])(\{\})/g;
                        _escape.lastIndex = _colcount;
                        var _escape_m = _escape.exec(_line_text);
                        if (_escape_m != null && _escape_m.index == _colcount) {
                            switch(_escape_m[1]) {
                                case '\\o':
                                    extoken += 'ø';
                                    break;
                                case '\\O':
                                    extoken += 'Ø';
                                    break;
                            }
                            token += _escape_m[0];
                            _pos += _escape_m[0].length;
                            _colcount += _escape_m[0].length;
                            charmap.push(_escape_m[0]);
                            continue;
                        }
                        // Handpick "RING ABOVE A"
                        _escape = /(\\(aa|AA))(\{\})/g;
                        _escape.lastIndex = _colcount;
                        var _escape_m = _escape.exec(_line_text);
                        if (_escape_m != null && _escape_m.index == _colcount) {
                            switch (_escape_m[1]) {
                                case '\\aa':
                                    extoken += 'å';
                                    break;
                                case '\\AA':
                                    extoken += 'Å';
                                    break;
                            }
                            token += _escape_m[0];
                            _pos += _escape_m[0].length;
                            _colcount += _escape_m[0].length;
                            charmap.push(_escape_m[0]);
                            continue;
                        }
                        // Handpick "COMBINED i/j (dot removed)"
                        _escape = /(\\[\`\'\^\"v])(\{)\\([ij])(\})/g;
                        _escape.lastIndex = _colcount;
                        var _escape_m = _escape.exec(_line_text);
                        if (_escape_m != null && _escape_m.index == _colcount) {
                            switch (_escape_m[1]) {
                                case '\\\`':
                                    extoken += (_escape_m[3] = 'i' ? 'ì' : ' ');
                                    break;
                                case '\\\'':
                                    extoken += (_escape_m[3] = 'i' ? 'í' : 'ȷ́');
                                    break;
                                case '\\\^':
                                    extoken += (_escape_m[3] = 'i' ? 'î' : 'ĵ');
                                    break;
                                case '\\\"':
                                    extoken += (_escape_m[3] = 'i' ? 'ï' : ' ');
                                    break;
                                case '\\v':
                                    extoken += (_escape_m[3] = 'j' ? 'ǰ' : 'J̌');
                                    break;
                            }
                            token += _escape_m[0];
                            _pos += _escape_m[0].length;
                            _colcount += _escape_m[0].length;
                            charmap.push(_escape_m[0]);
                            continue;
                        }
                        _pos++;
                        _colcount++;
                    }

                    // Build lexem to check
                    if (_line_text[_colcount] && SPELLRIGHT_LEXEM_BUILD.test(_line_text[_colcount])) {
                        token += _line_text[_colcount];
                        extoken += _line_text[_colcount];
                        charmap.push(_line_text[_colcount]);
                    }

                    // Check spelling & tag diagnostics
                    if (token && (SPELLRIGHT_LEXEM_SPELL.test(_line_text[_colcount]) || _colcount == _line_text.length - 1)) {

                        var _token = { word: extoken, parser: 'latex' };

                        if (token != extoken) {
                            _token.source = token;
                            _token.map = charmap;
                        }

                        if (typeof echaracter !== 'undefined') {
                            // Here skip spelling token (word) currently being changed
                            if (echaracter != colnumber + (token.length - 1)) {
                                checkAndMarkCallback(document, context, diagnostics, _token, linenumber, colnumber);
                            }
                        } else {
                            checkAndMarkCallback(document, context, diagnostics, _token, linenumber, colnumber);
                        }

                        token = '';
                        extoken = '';
                        charmap = [];
                    }
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
exports.default = LaTeX;
