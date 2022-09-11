// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017-2019 Bartosz Antosik. Licensed under the MIT License.
// -----------------------------------------------------------------------------

"use strict";

const path_1 = require("path");

const Null_1 = require("./parsers/null");
const Plaintext_1 = require("./parsers/plaintext");
const Markdown_1 = require("./parsers/markdown");
const Code_1 = require("./parsers/code");
const LaTeX_1 = require("./parsers/latex");
const Xml_1 = require("./parsers/xml");

// Gets a Parser for a document, taken from its file type
function fromDocument(settings, doc) {
    return fromSettings(settings, doc.languageId)
        || fromLanguage(doc.languageId)
        || fromExtension(path_1.extname(doc.uri._fsPath))
        || null;
}
exports.fromDocument = fromDocument;

// Get a document parser for a given language id. Returns null if the id
// is not known. Common parameters to parsers are:
//
// comment_start: string
// comment_end: string
// comment_line: string
// string_inline: character
// string_multiline: string,
// string_quote: character
// code_start: string
// code_end: string

function fromSettings(settings, id) {

    var _configuration = settings.parserByClass[id];

    if (_configuration) {
        switch (_configuration.parser) {
            case 'plain':
                return new Plaintext_1.default();
            case 'markdown':
                var code_start = _configuration.code_start || '\\`\\`\\`';
                var code_end = _configuration.code_end || '';
                var code_line = _configuration.code_line | '^ {4,}\\s*(?!(<!|\\`\\`\\`|\\*\\s|\\+\\s|\\-\\s|\\d+\\s))\\S+';
                return new Markdown_1.default({ code_start, code_end, code_line });
            case 'code':
                var comment_start = _configuration.comment_start || '\\/\\*';
                var comment_end = _configuration. comment_end || '\\*\\/';
                var comment_line = _configuration.comment_line || '//';
                var string_inline = _configuration.string_inline || '["\']';
                var string_quote = _configuration.string_quote || '\\';
                return new Code_1.default({ comment_start, comment_end, comment_line, string_inline, string_quote });
            case 'latex':
                return new LaTeX_1.default();
            case 'xml':
                return new Xml_1.default(true);
        }
    }
    return null;
}
exports.fromSettings = fromSettings;

function fromLanguage(id) {
    switch (id) {
        case 'ahk':
            return new Code_1.default({ comment_start: '\\/\\*', comment_end: '\\*\\/', comment_line: ';' });
        case 'bat':
            return new Code_1.default({ comment_line: 'rem|::', string_inline: '"', string_quote: '\\'  });
        // There can be slight differences in all of these but they're all basically the same
        case 'c':
        case 'csharp':
        case 'cpp':
        case 'css':
        case 'go':
        case 'groovy':
        case 'java':
        case 'javascript':
        case 'javascriptreact':
        case 'json':
        case 'jsonc':
        case 'less':
        case 'objective-c':
        case 'scss':
        case 'shaderlab':
        case 'swift':
        case 'typescript':
        case 'typescriptreact':
            return new Code_1.default({ comment_start: '\\/\\*', comment_end: '\\*\\/', comment_line: '//', string_inline: '["\']', string_quote: '\\' });
        case 'pascal':
            return new Code_1.default({ comment_start: '\\{', comment_end: '\\}', comment_line: '//', string_inline: '["\']', string_quote: '\\' });
        case 'd':
            return new Code_1.default({ comment_start: '\\/\\*', comment_end: '\\*\\/', comment_line: '//', string_inline: '["\']', string_multiline: '`', string_quote: '\\' });
        case 'elixir':
            return new Code_1.default({ comment_line: '#', string_inline: '["\']', string_multiline: '\'\'\'|\"\"\"', string_quote: '\\' });
        case 'clojure':
            return null;
        case 'coffeescript':
            return new Code_1.default({ comment_start: '###\\*?', comment_end: '###', comment_line: '#' });
        case 'diff':
            return null;
        case 'yaml':
            return new Code_1.default({ comment_line: '#', string_inline: '["\']', string_quote: '\\' });
        case 'toml':
        case 'dockerfile':
        case 'shellscript':
        case 'r':
        case 'makefile':
            return new Code_1.default({ comment_line: '#', string_inline: '"', string_quote: '\\' });
        case 'elm':
        case 'haskell':
        case 'purescript':
            return new Code_1.default({ comment_start: '{-', comment_end: '-}', comment_line: '--' });
        case 'fsharp':
            return new Code_1.default({ comment_start: '\\(\\*', comment_end: '\\*\\)', comment_line: '\\/\\/' });
        case 'git-commit':
        case 'git-rebase':
            return new Plaintext_1.default();
        case 'handlebars':
            return new Xml_1.default(true);
        case 'html':
        case 'erb':
            return new Xml_1.default(true);
        case 'http':
            return new Code_1.default({ comment_line: '#', string_inline: '"' });
        case 'mustache':
            return new Xml_1.default(true);
        case 'ini':
            return new Code_1.default({ comment_line: '[#;]' });
        case 'jade':
            return new Code_1.default({ comment_line: '\\/\\/' });
        case 'latex':
        case 'tex':
            return new LaTeX_1.default();
        case 'lua':
            return new Code_1.default({ comment_start: '--\\[\\[', comment_end: '\\]\\]', comment_line: '--' });
        case 'troff':
        case 'restructuredtext':
        case 'rst':
        case 'markdown':
            return new Markdown_1.default({ code_start: '\`\`\`', code_end: '', code_line: '^ {4,}\\s*(?!(<!|\\`\\`\\`|\\*\\s|\\+\\s|\\-\\s|\\d+\\s))\\S+' });
        case 'madoko':
            return new Markdown_1.default({ code_start: '\`\`\`', code_end: '', code_line: '^ {4,}\\s*(?!(<!|\\`\\`\\`|\\*\\s|\\+\\s|\\-\\s|\\d+\\s))\\S+'  });
        case 'asciidoc':
            return new Markdown_1.default({ code_start: '----(-)*', code_end: '' });
        case 'rmd':
            return new Markdown_1.default({ code_start: '\`\`\`', code_end: '', code_line: '^ {4,}\\s*(?!(<!|\\`\\`\\`|\\*\\s|\\+\\s|\\-\\s|\\d+\\s))\\S+'  });
        case 'quarto':
            return new Markdown_1.default({ code_start: '\`\`\`', code_end: '', code_line: '^ {4,}\\s*(?!(<!|\\`\\`\\`|\\*\\s|\\+\\s|\\-\\s|\\d+\\s))\\S+'  });
        case 'todo':
            return new Markdown_1.default({ code_start: '\`', code_end: '' });
        case 'plaintext':
        case 'diet':
            return new Plaintext_1.default();
        case 'perl':
            return new Code_1.default({ comment_start: '^=\\w+', comment_end: '^=cut', comment_line: '#' });
        case 'perl6':
            // TODO: multi-line comments in Perl 6
            // https://docs.perl6.org/language/syntax#Comments
        case 'ruby':
            return new Code_1.default({ comment_start: '^=begin', comment_end: '^=end', comment_line: '#' });
        case 'php':
            return new Code_1.default({ comment_start: '\\/\\*', comment_end: '\\*\\/', comment_line: '(?:\\/\\/|#)' });
        case 'powershell':
            return new Code_1.default({ comment_start: '<#', comment_end: '#>', comment_line: '#' });
        case 'python':
            return new Code_1.default({ comment_line: '#', string_inline: '["\']', string_multiline: '\'\'\'|\"\"\"', string_quote: '\\' });
        case 'razor':
            return null;
        case 'rust':
            return new Code_1.default({ comment_line: '\\/{2}(?:\\/|\\!)?' });
        case 'sql':
            return new Code_1.default({ comment_start: '\\/\\*', comment_end: '\\*\\/', comment_line: '--' });
        case 'vb':
            return new Code_1.default({ comment_line: "'" });
        case 'xml':
        case 'xsl':
            return new Xml_1.default({ comment_start: '<!--|<!\\\[CDATA\\\[', comment_end: '-->|\\\]\\\]' });
        case 'vue':
            return new Xml_1.default({ comment_start: '<!--|<!\\\[CDATA\\\[', comment_end: '-->|\\\]\\\]' });
        case 'julia':
            return new Code_1.default({ comment_start: '#=', comment_end: '=#', comment_line: '#', string_inline: '"', string_quote: '\\' });
        case 'juliamarkdown':
            return new Markdown_1.default({ code_start: '~~~~(~)*', code_end: '' });
        case 'ink':
        case 'mediawiki':
            return new Plaintext_1.default();
        case 'lisp':
            return new Code_1.default({ comment_line: ';', string_inline: '"', string_quote: '\\' });
        default:
            return null;
    }
}
exports.fromLanguage = fromLanguage;

// Gets a Parser for a given file extension (with period). Returns
// null if the extension is not known.
function fromExtension(extension) {
    switch (extension) {
        case '.ahk':
            return fromLanguage('ahk');
        case '.bbx':
        case '.cbx':
        case '.cls':
        case '.sty':
            return fromLanguage('tex');
        case '.cs':
            return fromLanguage('csharp');
        case '.elm':
            return fromLanguage('elm');
        case '.purs':
            return fromLanguage('purescript');
        case '.hs':
            return fromLanguage('haskell');
        case '.sass':
            // Pretend .sass comments are the same as .scss for basic support.
            // Actually they're slightly different.
            // http://sass-lang.com/documentation/file.INDENTED_SYNTAX.html
            return fromLanguage('scss');
        case '.tex':
            return fromLanguage('latex');
        case '.toml':
            return fromLanguage('toml');
        default:
            return null;
    }
}
exports.fromExtension = fromExtension;
