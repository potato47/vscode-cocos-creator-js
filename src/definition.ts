import * as vscode from 'vscode';
import { getSymbols, convertCCSymbols, getFilePath, excludeSet, getFileContent } from './utils';

export function registerDefinition(context: vscode.ExtensionContext) {
    let definition = vscode.languages.registerDefinitionProvider(['javascript'], {
        provideDefinition: async (document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) => {
            const fileName = document.fileName;
            const word = document.getText(document.getWordRangeAtPosition(position));
            const line = document.lineAt(position);
            const result = line.text.match(new RegExp(`\\w+(?=\\.${word})\|(?<=getComponent\\("|')\\w+(?="|')`));
            let module: string;
            if (result) {
                module = result[0];
            } else {
                if (!new RegExp(`(?<="|')${word}(?="|')`).test(line.text)) {
                    return;
                }
                module = word;
            }
            if (module === 'this') {
                let symbols = await getSymbols(document);
                symbols = convertCCSymbols(symbols, document);
                let symbol = symbols.find(symbol => symbol.name === word);
                if (symbol) {
                    return new vscode.Location(vscode.Uri.file(fileName), symbol.range);
                }
            } else {
                const filePath = getFilePath(module);
                if (!filePath) {
                    return;
                }
                const fileText = getFileContent(filePath);
                const lines = fileText.split('\n');
                let row = 0;
                let col = 0;
                let isMatch = false;
                if (word === module) {
                    isMatch = true;
                } else {
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
        }
    });

    context.subscriptions.push(definition);
}