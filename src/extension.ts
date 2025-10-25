import type * as vscode from "vscode";
import {
	createStatusBarItem,
	registerOpenWebviewCommand,
} from "./commands/openWebview.js";
import { registerTodoScanning } from "./commands/scanTodos.js";

export async function activate(context: vscode.ExtensionContext) {
	console.log("Activity tracker is now active!");

	// TODO/FIXME scanning
	await registerTodoScanning(context);

	// Webview command + status bar UI
	registerOpenWebviewCommand(context);
	createStatusBarItem(context);
}

export function deactivate() {}
