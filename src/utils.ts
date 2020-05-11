import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export let fileMap: { [name: string]: string };
export const excludeSet = new Set(['extends', 'properties', 'statics', 'editor', 'onLoad', 'start', 'update', 'onEnable', 'onDisable', 'onDestroy', 'if', 'else if', 'for', 'function', 'new', 'return', 'switch', 'throw', 'while']);

export function updateFileMap() {
    fileMap = {};
	const document = vscode.window.activeTextEditor?.document;
	if (!document) {
		return;
	}
	const result = document.fileName.match(/.+assets\//);
	if (!result) {
		return;
	}
	const workDir = result[0];
	const walkDir = (currentPath: string) => {
		const files = fs.readdirSync(currentPath);
		files.forEach(fileName => {
			const filePath = path.join(currentPath, fileName);
			const fileStat = fs.statSync(filePath);
			if (fileStat.isFile() && fileName.endsWith('.js')) {
				const key = fileName.substring(0, fileName.length - 3);
				fileMap[key] = filePath;
			} else if (fileStat.isDirectory()) {
				walkDir(filePath);
			}
		});
	};
	walkDir(workDir);
}

export function getFilePath(key: string) {
	if (fileMap) {
		return fileMap[key];
	} else {
		updateFileMap();
		return fileMap[key];
	}
}

export function getFileContent(filePath: string) {
    return fs.readFileSync(filePath).toString();
}

export async function getSymbols(document: vscode.TextDocument): Promise<vscode.DocumentSymbol[]> {
	vscode.commands.executeCommand<vscode.DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', document.uri) || [];
	return await vscode.commands.executeCommand<vscode.DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', document.uri) || [];
}

export function convertCCSymbols(symbols: vscode.DocumentSymbol[], document: vscode.TextDocument): vscode.DocumentSymbol[] {
	const ccSymbols: vscode.DocumentSymbol[] = [];
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
		} else if (symbol.kind !== vscode.SymbolKind.Variable) {
            if (/\w+/.test(symbol.name)) {
                ccSymbols.push(symbol);
            }
		}
	});
	return ccSymbols;
}

export async function goToSymbol(document: vscode.TextDocument, symbolName: string) {
	const symbols = await getSymbols(document);
	const findSymbol = symbols.find(symbol => symbol.name === symbolName);
	const activeTextEditor = vscode.window.activeTextEditor;
	if (findSymbol && activeTextEditor) {
		activeTextEditor.revealRange(findSymbol.range, vscode.TextEditorRevealType.AtTop);
		activeTextEditor.selection = new vscode.Selection(findSymbol.range.start, findSymbol.range.start);
	}
}