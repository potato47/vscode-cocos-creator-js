import * as vscode from 'vscode';
import { getSymbols, convertCCSymbols, getFilePath, excludeSet, getFileContent } from './utils';

export function registerCompletion(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('javascript', {
		provideCompletionItems: async (document, position, token, context) => {
			const line = document.lineAt(position);
			const lineText = line.text.substring(0, position.character - 1);
            const result = lineText.match(/\w+$|(?<=getComponent\("|')\w+/);
			if (!result) {
				return;
			}
			const module = result[0];
			if (module === 'this') {
				let symbols = await getSymbols(document);
				symbols = convertCCSymbols(symbols, document);
				const completionItems: vscode.CompletionItem[] = [];
				const uniqueSet = new Set();
				symbols.forEach(symbol => {
					if (!excludeSet.has(symbol.name) && !uniqueSet.has(symbol.name)) {
						const kindName = vscode.SymbolKind[symbol.kind];
						const completionItemKind: vscode.CompletionItemKind = vscode.CompletionItemKind[kindName as any] as any || vscode.CompletionItemKind.Field;
						completionItems.push(new vscode.CompletionItem(symbol.name, completionItemKind));
						uniqueSet.add(symbol.name);
					}
				});
				return completionItems;
			} else {
                const filePath = getFilePath(module);
                if (!filePath) {
                    return;
                }
				const fileText = getFileContent(filePath);
				const result = fileText.match(/(?<=\n[ ]+)\w+(?=:|\()/g);
				if (result) {
					const completionItems: vscode.CompletionItem[] = [];
					const uniqueSet = new Set();
					result.forEach(key => {
						if (!excludeSet.has(key) && !uniqueSet.has(key)) {
							completionItems.push(new vscode.CompletionItem(key, vscode.CompletionItemKind.Field));
							uniqueSet.add(key);
						}
					});
					return completionItems;
				}
			}
		},
		resolveCompletionItem: () => {
			return null;
		}
	}, '.'));
}