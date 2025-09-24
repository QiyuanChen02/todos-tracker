import * as vscode from 'vscode';
import * as path from 'path';

import { attachRouterToPanel, createRouter, procedure } from './rpcHost';
import { getWebviewContent } from './helpers/getWebviewContent';
import { router } from './router/router';

export function activate(context: vscode.ExtensionContext) {

	console.log('Activity tracker is now active!');

	let currentPanel: vscode.WebviewPanel | undefined = undefined;

	const openStatsCommand = vscode.commands.registerCommand('activity-tracker.openStats', () => {

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
                }
			);
			currentPanel.webview.html = getWebviewContent(context, currentPanel.webview);

            attachRouterToPanel(router, currentPanel, context, vscode);

            // parseRequests(context, currentPanel);

			currentPanel.onDidDispose(() => {
				currentPanel = undefined;
			}, null, context.subscriptions);
		}
	});

	context.subscriptions.push(openStatsCommand);
}

export function deactivate() {}
