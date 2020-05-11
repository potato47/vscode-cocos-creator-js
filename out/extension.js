"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const utils_1 = require("./utils");
const definition_1 = require("./definition");
const completion_1 = require("./completion");
function activate(context) {
    console.log('activate');
    definition_1.registerDefinition(context);
    completion_1.registerCompletion(context);
    utils_1.updateFileMap();
    vscode.workspace.onDidCreateFiles(() => {
        utils_1.updateFileMap();
    });
    vscode.workspace.onDidDeleteFiles(() => {
        utils_1.updateFileMap();
    });
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map