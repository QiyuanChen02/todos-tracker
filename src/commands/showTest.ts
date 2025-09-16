import { diffLines } from 'diff';
import * as vscode from 'vscode';

export async function showText(context: vscode.ExtensionContext) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const document = editor.document;
        const documentText = document.getText();
        const documentKey = document.uri.toString();
        const lastText = context.globalState.get<string>(documentKey, '');
        if (lastText && lastText !== documentText) {
            const diffs = diffLines(lastText, documentText);
            let diffMessage = 'Changes since last check:\n';
            diffs.forEach(part => {
                const symbol = part.added ? '+' : part.removed ? '-' : '=';
                const lines = part.value.split('\n');
                lines.forEach(line => {
                    console.log(`Line: "${line}"`);
                    if (line !== '') {
                        diffMessage += `${symbol} ${line}\n`;
                    }
                });
            });
            const doc = await vscode.workspace.openTextDocument({ content: diffMessage, language: 'diff' });
            vscode.window.showTextDocument(doc, { preview: false });
        } else {
            vscode.window.showInformationMessage('No changes since last check', { modal: true });
        }
        context.globalState.update(documentKey, documentText);
    } else {
        vscode.window.showInformationMessage('No active editor found');
    }
}