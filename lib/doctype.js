// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017 Bartosz Antosik. Licensed under the MIT License.
// -----------------------------------------------------------------------------

"use strict";

const path_1 = require("path");

const Null_1 = require("./parsers/null");
const Plaintext_1 = require("./parsers/plaintext");
const Markdown_1 = require("./parsers/markdown");
const Standard_1 = require("./parsers/standard");
const LaTeX_1 = require("./parsers/latex");
const Xml_1 = require("./parsers/xml");

// Gets a DocumentProcessor for a document, taken from its file type
function fromDocument(doc) {
    return fromLanguage(doc.languageId)
        || fromExtension(path_1.extname(doc.fileName))
        || new Null_1.default();
}
exports.fromDocument = fromDocument;

// Gets a DocumentProcessor for a given language id. Returns null if the id
// is not known.
function fromLanguage(id) {
    switch (id) {
        case 'ahk':
            return new Standard_1.default({ start: '\\/\\*', end: '\\*\\/', line: ';' });
        case 'bat':
            return new Standard_1.default({ line: 'rem|::', string: '"', quote: '\\'  });
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
        case 'less':
        case 'objective-c':
        case 'scss':
        case 'shaderlab':
        case 'swift':
        case 'typescript':
        case 'typescriptreact':
            return new Standard_1.default({ start: '\\/\\*', end: '\\*\\/', line: '//', string: '["\']', quote: '\\' });
        case 'clojure':
            return null;
        case 'coffeescript':
            return new Standard_1.default({ start: '###\\*?', end: '###', line: '#' });
        case 'diff':
            return null;
        case 'dockerfile':
        case 'makefile':
        case 'perl':
        case 'r':
        case 'shellscript':
        case 'toml':
        case 'yaml':
            return new Standard_1.default({ line: '#' });
        case 'elm':
        case 'haskell':
        case 'purescript':
            return new Standard_1.default({ start: '{-', end: '-}', line: '--' });
        case 'fsharp':
            return new Standard_1.default({ start: '\\(\\*', end: '\\*\\)', line: '\\/\\/' });
        case 'git-commit':
        case 'git-rebase':
            // These are plain text
            return null;
        case 'handlebars':
            return new Xml_1.default(true);
        case 'html':
            return new Xml_1.default(true);
        case 'mustache':
            return new Xml_1.default(true);
        case 'ini':
            return new Standard_1.default({ line: '[#;]' });
        case 'jade':
            return new Standard_1.default({ line: '\\/\\/' });
        case 'latex':
        case 'tex':
            return new LaTeX_1.default();
        case 'lua':
            return new Standard_1.default({ start: '--\\[\\[', end: '\\]\\]', line: '--' });
        case 'troff':
        case 'restructuredtext':
        case 'markdown':
            return new Markdown_1.default({ code_start: '\`\`\`', code_end: '' });
        case 'asciidoc':
            return new Markdown_1.default({ code_start: '----(-)*', code_end: '' });
        case 'plaintext':
            return new Plaintext_1.default();
        case 'perl6':
        case 'ruby':
            // Todo: multi-line comments in Perl 6
            // https://docs.perl6.org/language/syntax#Comments
            return new Standard_1.default({ start: '^=begin', end: '^=end', line: '#' });
        case 'php':
            return new Standard_1.default({ start: '\\/\\*', end: '\\*\\/', line: '(?:\\/\\/|#)' });
        case 'powershell':
            return new Standard_1.default({ start: '<#', end: '#>', line: '#' });
        case 'python':
            return new Standard_1.default({ start: "('''|\"\"\")", end: "('''|\"\"\")", line: '#', string: '["\']', quote: '\\' });
        case 'razor':
            return null;
        case 'rust':
            return new Standard_1.default({ line: '\\/{2}(?:\\/|\\!)?' });
        case 'sql':
            return new Standard_1.default({ start: '\\/\\*', end: '\\*\\/', line: '--' });
        case 'vb':
            return new Standard_1.default({ line: "'" });
        case 'xml':
        case 'xsl':
            return new Xml_1.default({ start: '<!--|<!\\\[CDATA\\\[', end: '-->|\\\]\\\]' });
        default:
            return null;
    }
}
exports.fromLanguage = fromLanguage;

// Gets a DocumentProcessor for a given file extension (with period). Returns
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
