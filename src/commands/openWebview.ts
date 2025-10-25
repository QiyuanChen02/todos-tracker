import * as path from "node:path";
import { attachRouterToPanel } from "@webview-rpc/host";
import * as vscode from "vscode";
import { getWebviewContent } from "../helpers/getWebviewContent.js";
import { updateNotificationEmitter } from "../helpers/updateNotification.js";
import { appRouter } from "../router/router.js";

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

			currentPanel = vscode.window.createWebviewPanel(
				"todosTracker",
				"Todos Tracker",
				vscode.ViewColumn.One,
				{
					enableScripts: true,
					retainContextWhenHidden: true,
					localResourceRoots: [
						vscode.Uri.file(
							path.join(context.extensionPath, "webview", "dist"),
						),
					],
					portMapping: [{ webviewPort: 5173, extensionHostPort: 5173 }],
				},
			);

			currentPanel.webview.html = await getWebviewContent(
				context,
				currentPanel.webview,
			);
			attachRouterToPanel(appRouter, currentPanel, context);

			// Subscribe to in-process todo updates and forward them to the webview.
			// The event returns a Disposable which we add to context.subscriptions so it
			// will be cleaned up automatically when the extension is deactivated.
			const todosSub = updateNotificationEmitter.event((type) => {
				if (currentPanel) {
					currentPanel.webview.postMessage({ type });
				}
			});
			context.subscriptions.push(todosSub);

			currentPanel.onDidDispose(
				() => {
					currentPanel = undefined;
				},
				null,
				context.subscriptions,
			);
		},
	);

	context.subscriptions.push(disposable);
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
