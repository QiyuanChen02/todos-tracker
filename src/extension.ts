import type * as vscode from "vscode";
import {
	createStatusBarItem,
	registerOpenWebviewCommand,
} from "./commands/openWebview.js";

export async function activate(context: vscode.ExtensionContext) {
	console.log("Activity tracker is now active!");

	// Webview Command
	registerOpenWebviewCommand(context);

	// Status bar UI
	createStatusBarItem(context);
}

export function deactivate() {}
