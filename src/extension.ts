import * as path from 'path';
import * as vscode from 'vscode';

import { getWebviewContent } from './helpers/getWebviewContent';
import { router } from './router/router';
import { attachRouterToPanel } from './rpcHost';

export function activate(context: vscode.ExtensionContext) {

	console.log('Activity tracker is now active!');

	let currentPanel: vscode.WebviewPanel | undefined = undefined;

	const openStatsCommand = vscode.commands.registerCommand('activity-tracker.openStats', async () => {

		if (currentPanel) {
			currentPanel.reveal(vscode.ViewColumn.One);
		} else {
			currentPanel = vscode.window.createWebviewPanel(
				'activityStats',
				'Activity Stats',
				vscode.ViewColumn.One,
				{
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: [
                        vscode.Uri.file(path.join(context.extensionPath, 'webview', 'dist'))
                    ],
					portMapping: [{ webviewPort: 5173, extensionHostPort: 5173 }]
                }
			);
			currentPanel.webview.html = await getWebviewContent(context, currentPanel.webview);

            attachRouterToPanel(router, currentPanel, context, vscode);

			currentPanel.onDidDispose(() => {
				currentPanel = undefined;
			}, null, context.subscriptions);
		}
	});

	context.subscriptions.push(openStatsCommand);
}

export function deactivate() {}
