// -----------------------------------------------------------------------------
// Spell Right extension for Visual Studio Code (VSCode)
// Copyright (c) 2017-2018 Bartosz Antosik. Licensed under the MIT License.
// -----------------------------------------------------------------------------

'use strict';

const vscode_languageserver_1 = require("vscode-languageserver");

// Create a connection for the server. The connection uses Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = vscode_languageserver_1.createConnection(vscode_languageserver_1.ProposedFeatures.all);

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents = new vscode_languageserver_1.TextDocuments();

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params) => {
    let capabilities = params.capabilities;
    // Does the client support the `workspace/configuration` request?
    // If not, we will fall back using global settings
    hasConfigurationCapability = !!(capabilities.workspace &&
        !!capabilities.workspace.configuration);
    hasWorkspaceFolderCapability = !!(capabilities.workspace &&
        !!capabilities.workspace.workspaceFolders);
    hasDiagnosticRelatedInformationCapability =
        !!(capabilities.textDocument &&
            capabilities.textDocument.publishDiagnostics &&
            capabilities.textDocument.publishDiagnostics.relatedInformation);
    return {
        capabilities: {
            // Definetly incremental synchronization
            textDocumentSync: vscode_languageserver_1.TextDocumentSyncKind.Incremental,
            // Tell the client that the server supports code completion
            completionProvider: { resolveProvider: true }
        }
    };
});

connection.onInitialized(() => {
    if (hasConfigurationCapability) {
        // Register for all configuration changes.
        connection.client.register(vscode_languageserver_1.DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(event => {
        });
    }
});

connection.onDidChangeConfiguration(change => {
    connection.console.log('onDidChangeConfiguration');
});


documents.onDidClose(event => {
    connection.console.log('onDidClose');
});

documents.onDidChangeContent(change => {
    connection.console.log('onDidChangeContent');
});

connection.onDidOpenTextDocument((params) => {
    connection.console.log(`${params.textDocument.uri} opened.`);
});

connection.onDidChangeTextDocument((params) => {
    connection.console.log(`${params.textDocument.uri} changed: ${JSON.stringify(params.contentChanges)}`);
});

connection.onDidCloseTextDocument((params) => {
    connection.console.log(`${params.textDocument.uri} closed.`);
});

documents.listen(connection);
connection.listen();

Object.defineProperty(exports, "__esModule", { value: true });
