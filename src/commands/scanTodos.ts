import * as vscode from "vscode";
import { fireUpdate } from "../helpers/updateNotification.js";

const TODO_REGEX = /\b(?:TODO|FIXME)\b/g;
const TODOS_STORAGE_KEY = "activeTodos";

export interface TodoItem {
	id: string;
	filePath: string;
	line: number;
	preview: string;
}

// Global data structure to store all active TODOs as an array
let activeTodos: TodoItem[] = [];
let workspaceState: vscode.Memento | null = null;

/**
 * Build a predicate that returns true if a file should be scanned,
 * based on the workspace root's .gitignore rules.
 */

/**
 * Remove all TODOs for a specific file from the active todos array
 */
function clearTodosForFile(filePath: string) {
	activeTodos = activeTodos.filter((t) => t.filePath !== filePath);
}

/**
 * Save the current activeTodos array to workspaceState
 */
async function saveTodosToStorage() {
	if (!workspaceState) return;
	await workspaceState.update(TODOS_STORAGE_KEY, activeTodos);

	// Fire the shared in-process event so any subscriber (for example the webview wiring)
	// can react to the change. This avoids using VS Code commands and keeps things
	// decoupled.
	try {
		fireUpdate("todosUpdated");
	} catch {
		// best-effort: ignore any listener errors
	}
}

/**
 * Scans a single document for TODO/FIXME and updates the active todos array.
 */
async function scanDocument(doc: vscode.TextDocument) {
	const text = doc.getText();
	const filePath = doc.uri.fsPath;

	// Remove existing TODOs for this file
	clearTodosForFile(filePath);

	// Find and add current TODOs
	for (const match of text.matchAll(TODO_REGEX)) {
		const idx = match.index ?? 0;
		const line = doc.positionAt(idx).line;
		const preview = doc.lineAt(line).text.trim();
		const todoId = crypto.randomUUID();

		const todoItem: TodoItem = {
			id: todoId,
			filePath: filePath,
			line: line + 1,
			preview: preview,
		};

		activeTodos.push(todoItem);
		console.log(`[Activity Tracker] Added TODO: ${todoId} — ${preview}`);
	}

	// Save to storage after each update
	await saveTodosToStorage();
}

/**
 * Get all active TODOs
 */
export function getActiveTodos(): TodoItem[] {
	return activeTodos.slice();
}

/**
 * Get TODO count
 */
export function getTodoCount(): number {
	return activeTodos.length;
}

/**
 * Registers listeners for incremental scanning, and runs an initial workspace scan.
 */
export async function registerTodoScanning(context: vscode.ExtensionContext) {
	// Store the workspaceState reference
	workspaceState = context.workspaceState;

	// Incremental scans
	const onChange = vscode.workspace.onDidChangeTextDocument((e) => {
		void scanDocument(e.document);
	});
	const onSave = vscode.workspace.onDidSaveTextDocument((doc) => {
		void scanDocument(doc);
	});

	// Handle file deletion
	const onDelete = vscode.workspace.onDidDeleteFiles(async (e) => {
		for (const file of e.files) {
			clearTodosForFile(file.fsPath);
		}
		await saveTodosToStorage();
	});

	context.subscriptions.push(onChange, onSave, onDelete);
}
