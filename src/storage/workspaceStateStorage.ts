import type * as vscode from "vscode";
import { type WorkspaceState, workspaceStateSchema } from "./schema.js";

const WORKSPACE_STATE_KEY = "workspaceState";

/**
 * Get workspace state with Zod validation
 */
export async function getWorkspaceState(
	context: vscode.ExtensionContext,
): Promise<WorkspaceState | null> {
	const data = context.workspaceState.get<unknown>(WORKSPACE_STATE_KEY);
	if (!data) return null;

	try {
		return workspaceStateSchema.parse(data);
	} catch (error) {
		console.error("Failed to validate workspace state:", error);
		return null;
	}
}

/**
 * Update workspace state with Zod validation
 */
export async function updateWorkspaceState(
	context: vscode.ExtensionContext,
	state: Partial<WorkspaceState>,
): Promise<void> {
	const currentState = await getWorkspaceState(context);

	// Merge with existing state or use defaults
	const newState: WorkspaceState = {
		currentTab: state.currentTab ?? currentState?.currentTab,
		calendarWeek: state.calendarWeek ?? currentState?.calendarWeek,
	};

	// Validate before saving
	const validated = workspaceStateSchema.parse(newState);
	await context.workspaceState.update(WORKSPACE_STATE_KEY, validated);
}

/**
 * Clear workspace state
 */
export async function clearWorkspaceState(
	context: vscode.ExtensionContext,
): Promise<void> {
	await context.workspaceState.update(WORKSPACE_STATE_KEY, undefined);
}
