import * as vscode from 'vscode';
import { diffLines } from 'diff';

// Format diffs for a single file. Exported so it can be unit-tested.
export const formatDiff = (relPath: string, oldText: string, newText: string) => {
    const diffs = diffLines(oldText || '', newText || '');
    let msg = `--- ${relPath} ---\n`;
    diffs.forEach(part => {
        const symbol = part.added ? '+' : part.removed ? '-' : '=';
        const lines = part.value.split('\n');
        lines.forEach(line => {
            if (line !== '') {
                msg += `${symbol} ${line}\n`;
            }
        });
    });
    return msg;
};

// Compute diffs for new and modified files by comparing previous and current snapshots.
// Returns an array of diff strings (one or more per file). Pure function, unit-testable.
export const computeDiffs = (previousSnapshot: Record<string, string>, currentSnapshot: Record<string, string>) => {
    const diffsPerFile: string[] = [];
    for (const relPath of Object.keys(currentSnapshot)) {
        const docText = currentSnapshot[relPath] || '';
        const previousText = previousSnapshot[relPath];
        if (previousText === undefined) {
            // New file
            diffsPerFile.push(`+++ ${relPath} (new file) +++\n` + formatDiff(relPath, '', docText));
        } else if (previousText !== docText) {
            diffsPerFile.push(formatDiff(relPath, previousText, docText));
        }
    }
    return diffsPerFile;
};

// Detect deleted files: keys in previousSnapshot that are not present in currentSnapshot.
export const detectDeletedDiffs = (previousSnapshot: Record<string, string>, currentSnapshot: Record<string, string>) => {
    const diffsPerFile: string[] = [];
    const currentPaths = new Set(Object.keys(currentSnapshot));
    for (const relPath of Object.keys(previousSnapshot)) {
        if (!currentPaths.has(relPath)) {
            const oldText = previousSnapshot[relPath] || '';
            diffsPerFile.push(`--- ${relPath} (deleted) ---\n` + formatDiff(relPath, oldText, ''));
        }
    }
    return diffsPerFile;
};

// Main exported command that uses vscode APIs. Keeps the higher-level orchestration.
export const showChanges = async (context?: vscode.ExtensionContext) => {

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return { info: 'No workspace folder open', diff: '' };
    }

    // Use the first workspace folder by default
    const workspace = workspaceFolders[0];
    const snapshotKey = workspace.uri.toString();

    // Log the snapshot key to ensure it matches during storage and retrieval
    console.log('Snapshot Key:', snapshotKey);

    // Load previous snapshot (map of relativePath -> text)
    const rawSnapshot = context?.globalState.get(snapshotKey);
    console.log('Raw Snapshot:', rawSnapshot);

    const previousSnapshot = rawSnapshot as Record<string, string> || {};
    if (!rawSnapshot) {
        console.warn('No previous snapshot found for key:', snapshotKey);
    }

    // Find files to consider. Exclude node_modules, .git folders, and package.json files by default.
    const files = await vscode.workspace.findFiles('**/*', '{**/node_modules/**,**/.git/**}');

    const currentSnapshot: Record<string, string> = {};
    const diffsPerFile: string[] = [];

    for (const uri of files) {
        try {
            const relPath = vscode.workspace.asRelativePath(uri, false);

            // Only process files that are likely text. Try opening as text document.
            let docText = '';
            try {
                const doc = await vscode.workspace.openTextDocument(uri);
                docText = doc.getText();
            } catch (e) {
                // Skip binary/undecodable files
                continue;
            }

            currentSnapshot[relPath] = docText;
        } catch (err) {
            console.warn('Error reading file for showChanges:', err);
            // continue with other files
        }
    }

    // Compute diffs (new/modified)
    diffsPerFile.push(...computeDiffs(previousSnapshot, currentSnapshot));
    // Detect deleted files
    diffsPerFile.push(...detectDeletedDiffs(previousSnapshot, currentSnapshot));

    // Persist current snapshot
    try {
        await context?.globalState.update(snapshotKey, currentSnapshot);
    } catch (err) {
        console.error('Failed to update snapshot in globalState:', err);
    }

    if (diffsPerFile.length > 0) {
        const header = `Changes since last check (workspace: ${workspace.name}):\n`;
        const diffMessage = header + diffsPerFile.join('\n');
        return { info: 'Changes found', diff: diffMessage };
    }

    return { info: 'No changes since last check', diff: '' };
};