import * as path from "node:path";
import { attachRouterToPanel } from "@webview-rpc/host";
import * as vscode from "vscode";
import { getWebviewContent } from "../helpers/getWebviewContent.js";
import { appRouter, type Context } from "../router/router.js";

let currentPanel: vscode.WebviewPanel | undefined;

/**
 * Registers the command that opens (or reveals) the Todos Tracker webview panel.
 * Command id: todos-tracker.openTodos
 */
export function registerOpenWebviewCommand(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand(
		"todos-tracker.openTodos",
		async () => {
			if (currentPanel) {
				currentPanel.reveal(vscode.ViewColumn.One);
				return;
			}

			await openWebviewPanel(context);
		},
	);

	context.subscriptions.push(disposable);
}

/**
 * Opens the webview panel with the todos tracker UI.
 */
async function openWebviewPanel(context: vscode.ExtensionContext) {
	currentPanel = vscode.window.createWebviewPanel(
		"todosTracker",
		"Todos Tracker",
		vscode.ViewColumn.One,
		{
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.file(path.join(context.extensionPath, "webview", "dist")),
				vscode.Uri.file(
					path.join(
						context.extensionPath,
						"node_modules",
						"@vscode",
						"codicons",
						"dist",
					),
				),
			],
		},
	);

	currentPanel.webview.html = await getWebviewContent(
		context,
		currentPanel.webview,
	);

	attachRouterToPanel<Context>(appRouter, currentPanel, {
		vsContext: context,
	});

	currentPanel.onDidDispose(
		() => {
			currentPanel = undefined;
		},
		null,
		context.subscriptions,
	);
}

/**
 * Creates and registers a status bar item that triggers the Todos Tracker webview.
 */
export function createStatusBarItem(context: vscode.ExtensionContext) {
	const item = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Left,
		100,
	);
	item.text = "$(checklist) Todos";
	item.tooltip = "Open Todos Tracker";
	item.command = "todos-tracker.openTodos";
	item.name = "Todos Tracker";
	item.show();

	context.subscriptions.push(item);
}
