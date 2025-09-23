import * as vscode from 'vscode';
import { showChanges } from './showchanges';

interface WebviewMessage {
  command: keyof typeof actions;
  data?: any;
}

// Define a response type
interface WebviewResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const parseRequests = (context: vscode.ExtensionContext, currentPanel: vscode.WebviewPanel) => {
    currentPanel.webview.onDidReceiveMessage(async (message: WebviewMessage) => {
        try {
            if (message.command in actions) {
                // pass context to action handlers so they can access globalState or other APIs
                const returnData = await actions[message.command](message.data, context);
                currentPanel.webview.postMessage({
                    success: true,
                    data: returnData,
                } as WebviewResponse);
            } else {
                console.log(`No action found for command: ${message.command}`);
                currentPanel.webview.postMessage({
                    success: false,
                    error: `Unknown command: ${message.command}`,
                } as WebviewResponse);
            }
        } catch (error) {
            console.error(`Error processing command ${message.command}:`, error);
            currentPanel.webview.postMessage({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            } as WebviewResponse);
        }

    }, undefined, context.subscriptions);
}

const actions = {
    "sample": (data?: any) => {
        console.log('Sample action executed with data:', data);
        return { info: 'Sample data from extension' }
    },
    "showImportantStats": (data?: any) => {
        console.log('Show Important Stats action executed with data:', data);
        vscode.window.showInformationMessage('Important stats displayed!');
        return { info: 'Important stats action completed' }
    },
    "showChanges": showChanges,
}

export type ActionKey = keyof typeof actions;