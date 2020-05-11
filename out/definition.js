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
function registerDefinition(context) {
    let definition = vscode.languages.registerDefinitionProvider(['javascript'], {
        provideDefinition: (document, position, token) => __awaiter(this, void 0, void 0, function* () {
            const fileName = document.fileName;
            const word = document.getText(document.getWordRangeAtPosition(position));
            const line = document.lineAt(position);
            const result = line.text.match(new RegExp(`\\w+(?=\\.${word})\|(?<=getComponent\\("|')\\w+(?="|')`));
            let module;
            if (result) {
                module = result[0];
            }
            else {
                if (!new RegExp(`(?<="|')${word}(?="|')`).test(line.text)) {
                    return;
                }
                module = word;
            }
            if (module === 'this') {
                let symbols = yield utils_1.getSymbols(document);
                symbols = utils_1.convertCCSymbols(symbols, document);
                let symbol = symbols.find(symbol => symbol.name === word);
                if (symbol) {
                    return new vscode.Location(vscode.Uri.file(fileName), symbol.range);
                }
            }
            else {
                const filePath = utils_1.getFilePath(module);
                if (!filePath) {
                    return;
                }
                const fileText = utils_1.getFileContent(filePath);
                const lines = fileText.split('\n');
                let row = 0;
                let col = 0;
                let isMatch = false;
                if (word === module) {
                    isMatch = true;
                }
                else {
                    for (let i = 0; i < lines.length; i++) {
                        if (new RegExp(`[ ]+${word}\\W`).test(lines[i])) {
                            row = i;
                            col = 0;
                            isMatch = true;
                            break;
                        }
                    }
                }
                if (isMatch) {
                    return new vscode.Location(vscode.Uri.file(filePath), new vscode.Position(row, col));
                }
            }
        })
    });
    context.subscriptions.push(definition);
}
exports.registerDefinition = registerDefinition;
//# sourceMappingURL=definition.js.map