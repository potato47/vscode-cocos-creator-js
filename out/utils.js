"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
exports.excludeSet = new Set(['extends', 'properties', 'statics', 'editor', 'onLoad', 'start', 'update', 'onEnable', 'onDisable', 'onDestroy', 'if', 'else if', 'for', 'function', 'new', 'return', 'switch', 'throw', 'while']);
function updateFileMap() {
    var _a;
    exports.fileMap = {};
    const document = (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document;
    if (!document) {
        return;
    }
    const result = document.fileName.match(/.+assets\//);
    if (!result) {
        return;
    }
    const workDir = result[0];
    const walkDir = (currentPath) => {
        const files = fs.readdirSync(currentPath);
        files.forEach(fileName => {
            const filePath = path.join(currentPath, fileName);
            const fileStat = fs.statSync(filePath);
            if (fileStat.isFile() && fileName.endsWith('.js')) {
                const key = fileName.substring(0, fileName.length - 3);
                exports.fileMap[key] = filePath;
            }
            else if (fileStat.isDirectory()) {
                walkDir(filePath);
            }
        });
    };
    walkDir(workDir);
}
exports.updateFileMap = updateFileMap;
function getFilePath(key) {
    if (exports.fileMap) {
        return exports.fileMap[key];
    }
    else {
        updateFileMap();
        return exports.fileMap[key];
    }
}
exports.getFilePath = getFilePath;
function getFileContent(filePath) {
    return fs.readFileSync(filePath).toString();
}
exports.getFileContent = getFileContent;
function getSymbols(document) {
    return __awaiter(this, void 0, void 0, function* () {
        vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', document.uri) || [];
        return (yield vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', document.uri)) || [];
    });
}
exports.getSymbols = getSymbols;
function convertCCSymbols(symbols, document) {
    const ccSymbols = [];
    const result = document.fileName.match(/\w+(?=.js)/);
    if (result) {
        const classSymbol = symbols.find(symbol => symbol.name === result[0]);
        if (classSymbol) {
            symbols = classSymbol.children;
        }
    }
    symbols.forEach(symbol => {
        if (symbol.name === 'properties') {
            symbol.children.forEach(symbolChild => {
                if (/\w+/.test(symbolChild.name)) {
                    ccSymbols.push(symbolChild);
                }
            });
        }
        else if (symbol.kind !== vscode.SymbolKind.Variable) {
            if (/\w+/.test(symbol.name)) {
                ccSymbols.push(symbol);
            }
        }
    });
    return ccSymbols;
}
exports.convertCCSymbols = convertCCSymbols;
function goToSymbol(document, symbolName) {
    return __awaiter(this, void 0, void 0, function* () {
        const symbols = yield getSymbols(document);
        const findSymbol = symbols.find(symbol => symbol.name === symbolName);
        const activeTextEditor = vscode.window.activeTextEditor;
        if (findSymbol && activeTextEditor) {
            activeTextEditor.revealRange(findSymbol.range, vscode.TextEditorRevealType.AtTop);
            activeTextEditor.selection = new vscode.Selection(findSymbol.range.start, findSymbol.range.start);
        }
    });
}
exports.goToSymbol = goToSymbol;
//# sourceMappingURL=utils.js.map