// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017 Bartosz Antosik. Licensed under the MIT License.
// -----------------------------------------------------------------------------

'use strict';

global.SPELLRIGHT_DEBUG_OUTPUT = false;
global.SPELLRIGHT_LINES_BATCH = 10;

var spellright = require('./spellright');
var vscode = require('vscode');

function activate(context) {

    if (SPELLRIGHT_DEBUG_OUTPUT) {
        console.log('SpellRight activated (' + process.platform + ', ' + process.arch + ').');

        var config = vscode.workspace.getConfiguration('');
        console.log(config);

        // I would love if there would be a chance to get access to
        // languageId to LanguageName conversion. Similarly would be great to
        // have access to languages syntax elements like line/block comments,
        // string delimiters or quoting character etc.
        //
        // vscode.languages.getLanguages().then((languages) => {
        //     console.log('Known languages: ' + languages);
        // });
    }

    var SpellRight = new spellright.default();

    SpellRight.activate(context);
}
exports.activate = activate;

function deactivate() {

    SpellRight.deactivate();

    if (SPELLRIGHT_DEBUG_OUTPUT)
        console.log('SpellRight deactivated.');
}
exports.deactivate = deactivate;