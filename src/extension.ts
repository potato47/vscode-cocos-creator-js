import * as vscode from 'vscode';
import { updateFileMap } from './utils';
import { registerDefinition } from './definition';
import { registerCompletion } from './completion';

export function activate(context: vscode.ExtensionContext) {
	console.log('activate');
	registerDefinition(context);
	registerCompletion(context);
	updateFileMap();
	vscode.workspace.onDidCreateFiles(() => {
		updateFileMap();
	});
	vscode.workspace.onDidDeleteFiles(() => {
		updateFileMap();
	});
}

export function deactivate() { }
