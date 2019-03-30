// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017-2019 Bartosz Antosik. Licensed under the MIT License.
// -----------------------------------------------------------------------------

'use strict';

const vscode = require('vscode');

const Parser = require('../parser');
const DocumentTypes = require('../doctype');

class Plaintext extends Parser.default {

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

        if (document.languageId === 'mediawiki') {
            var re = /(<([^>]+)>)/ig;
            while (match = re.exec(text)) {
                var replace = ' '.repeat(match[0].length);
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

        if (document.languageId === 'git-commit' || document.languageId === 'git-rebase') {
            // Remove tail part after `# ------------------------ >8 -...`
            var re = /\# -[-]+ >8 -[-][\s\S]*/gm;
            while (match = re.exec(text)) {
                var replace = ' '.repeat(match[0].length);
                text = Parser.replaceAt(text, match.index, replace);
            }
            // Remove line comments `# ...`
            var re = /#.*$/gm;
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

        var InContent = true;

        var _line_text = '';
        var _line_trace = (-1);

        var token = '';
        var linenumber = 0;
        var colnumber = 0;

        if (typeof sline === 'undefined')
            sline = 0;
        if (typeof eline === 'undefined')
            eline = Number.MAX_SAFE_INTEGER;

        var context = '';

        // Extract areas to spellcheck (body, comments, strings etc.)
        while (_pos < text.length) {

            if (InContent) {
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

                        context = 'body';
                        contextCallback(context);

                        if (typeof echaracter !== 'undefined') {
                            // Here skip spelling token (word) currently being changed
                            if (echaracter != colnumber + (token.length - 1)) {
                                checkAndMarkCallback(document, context, diagnostics, { word: token, parser: 'plaintext' }, linenumber, colnumber);
                            }
                        } else {
                            checkAndMarkCallback(document, context, diagnostics, { word: token, parser: 'plaintext' }, linenumber, colnumber);
                        }
                        token = '';
                    }
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
exports.default = Plaintext;
