// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017-2019 Bartosz Antosik. Licensed under the MIT License.
// -----------------------------------------------------------------------------

'use strict';

const common = require('./common');

const spellright = require('./spellright');
const vscode = require('vscode');
const vscode_lc = require('vscode-languageclient');
const path = require('path');

var client;

function activate(context) {

    // if (vscode.env.remoteName) {
    //     return;
    // }

    var serverModule = context.asAbsolutePath(path.join('src', 'server.js'));

    var debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

    // If the extension is launched in debug mode then the debug server
    // options are used. Otherwise the run options are used.
    var serverOptions = {
        run: {
            module: serverModule,
            transport: vscode_lc.TransportKind.ipc
        },
        debug: {
            module: serverModule,
            transport: vscode_lc.TransportKind.ipc,
            options: debugOptions
        }
    }

    var clientOptions = {
        documentSelector: [
            { scheme: 'file', language: '*' }
        ],
        synchronize: {
            configurationSection: 'spellright'
        },
        diagnosticCollectionName: 'spellright'
    }

    // Create the language client and start the client.
    client = new vscode_lc.LanguageClient('spellright', 'Spell Right', serverOptions, clientOptions);
    // Start the client. This will also launch the server
    client.start();

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

    // var SpellRight = new spellright.default();

    // SpellRight.activate(context);
}
exports.activate = activate;

function deactivate() {

    // SpellRight.deactivate();

    if (!client) {
        return undefined;
    }
    return client.stop();

    if (SPELLRIGHT_DEBUG_OUTPUT)
        console.log('[spellright] Deactivated.');
}
exports.deactivate = deactivate;