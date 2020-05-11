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
const utils_1 = require("./utils");
function registerCompletion(context) {
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('javascript', {
        provideCompletionItems: (document, position, token, context) => __awaiter(this, void 0, void 0, function* () {
            const line = document.lineAt(position);
            const lineText = line.text.substring(0, position.character - 1);
            const result = lineText.match(/\w+$|(?<=getComponent\("|')\w+/);
            if (!result) {
                return;
            }
            const module = result[0];
            if (module === 'this') {
                let symbols = yield utils_1.getSymbols(document);
                symbols = utils_1.convertCCSymbols(symbols, document);
                const completionItems = [];
                const uniqueSet = new Set();
                symbols.forEach(symbol => {
                    if (!utils_1.excludeSet.has(symbol.name) && !uniqueSet.has(symbol.name)) {
                        const kindName = vscode.SymbolKind[symbol.kind];
                        const completionItemKind = vscode.CompletionItemKind[kindName] || vscode.CompletionItemKind.Field;
                        completionItems.push(new vscode.CompletionItem(symbol.name, completionItemKind));
                        uniqueSet.add(symbol.name);
                    }
                });
                return completionItems;
            }
            else {
                const filePath = utils_1.getFilePath(module);
                if (!filePath) {
                    return;
                }
                const fileText = utils_1.getFileContent(filePath);
                const result = fileText.match(/(?<=\n[ ]+)\w+(?=:|\()/g);
                if (result) {
                    const completionItems = [];
                    const uniqueSet = new Set();
                    result.forEach(key => {
                        if (!utils_1.excludeSet.has(key) && !uniqueSet.has(key)) {
                            completionItems.push(new vscode.CompletionItem(key, vscode.CompletionItemKind.Field));
                            uniqueSet.add(key);
                        }
                    });
                    return completionItems;
                }
            }
        }),
        resolveCompletionItem: () => {
            return null;
        }
    }, '.'));
}
exports.registerCompletion = registerCompletion;
//# sourceMappingURL=completion.js.map