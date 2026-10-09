// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017-2019 Bartosz Antosik. Licensed under the MIT License.
// -----------------------------------------------------------------------------

'use strict';

global.SPELLRIGHT_DEBUG_OUTPUT = false;
global.SPELLRIGHT_LINES_BATCH = 10;
global.SPELLRIGHT_MILLISECS_BATCH = 100;

global.SPELLRIGHT_STATUSBAR_ITEM_PRIORITY = (-1);

const vscode = require('vscode');

var SpellRight = null;

function activate(context) {
    var spellright = null;
    try {
        spellright = require('./spellright');
    } catch (err) {
        // Native binding (or another hard dependency) failed to load.
        // Stay deactivated but tell the user why instead of crashing
        // the extension host activation with a cryptic TypeError.
        console.error('[spellright] Activation failed: ' + (err && err.message ? err.message : err));
        vscode.window.showErrorMessage('SpellRight: activation failed. ' + (err && err.message ? err.message : err));
        return;
    }

    if (SPELLRIGHT_DEBUG_OUTPUT) {
        console.log('[spellright] Activated (' + process.platform + ', ' + process.arch + ').');

        // I would love if there would be a chance to get access to
        // languageId to LanguageName conversion. Similarly would be great to
        // have access to languages syntax elements like line/block comments,
        // string delimiters or quoting character etc.
        //
        // vscode.languages.getLanguages().then((languages) => {
        //     console.log('Known languages: ' + languages);
        // });
    }

    SpellRight = new spellright.default();

    return SpellRight.activate(context);
}
exports.activate = activate;

function deactivate() {

    if (SpellRight !== null) {
        SpellRight.deactivate();
    }

    if (SPELLRIGHT_DEBUG_OUTPUT)
        console.log('[spellright] Deactivated.');
}
exports.deactivate = deactivate;