import * as vscode from 'vscode';
import { diffLines } from 'diff';
import { showText } from './commands/showTest';

export function activate(context: vscode.ExtensionContext) {

	console.log('Activity tracker is now active!');

	let currentPanel: vscode.WebviewPanel | undefined = undefined;

	const showTextCommand = vscode.commands.registerCommand('activity-tracker.showText', () => showText(context));
	const openStatsCommand = vscode.commands.registerCommand('activity-tracker.openStats', () => {

		if (currentPanel) {
			currentPanel.reveal(vscode.ViewColumn.One);
		} else {
			currentPanel = vscode.window.createWebviewPanel(
				'activityStats',
				'Activity Stats',
				vscode.ViewColumn.One,
				{}
			);
			currentPanel.webview.html = getWebviewContent();

			currentPanel.onDidDispose(() => {
				currentPanel = undefined;
			}, null, context.subscriptions);
		}
	});

	context.subscriptions.push(openStatsCommand);
	context.subscriptions.push(showTextCommand);
}

function getWebviewContent() {
	return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Activity Stats</title>
	</head>
	<body>
		<h1>Activity Stats</h1>
		<p>This is where activity statistics will be displayed.</p>
	</body>
	</html>`;
}

export function deactivate() {}
