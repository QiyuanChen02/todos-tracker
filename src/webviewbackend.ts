import * as vscode from 'vscode';

export const parseRequests = (context: vscode.ExtensionContext, currentPanel: vscode.WebviewPanel) => {
    currentPanel.webview.onDidReceiveMessage((message: { command: keyof typeof actions }) => {
        console.log('Message received from webview:', message);
        if (message.command in actions) {
            const returnData = actions[message.command]();
            currentPanel.webview.postMessage({ ...returnData });
        } else {
            console.log(`No action found for command: ${message.command}`);
        }
    }, undefined, context.subscriptions);
}

const actions = {
    "sample": () => {
        return { info: 'Sample data from extension' }
    },
    "showImportantStats": () => {
        vscode.window.showInformationMessage('Important stats displayed!');
        return { info: 'Important stats action completed' }
    }
}

export type ActionKey = keyof typeof actions;