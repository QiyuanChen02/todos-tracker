import type * as vscode from "vscode";
import {
	type ColumnOrder,
	kanbanColumnOrderSchema,
	type Todo,
} from "./schema.js";
import { getAllTodos } from "./todoStorage.js";

const KANBAN_COLUMN_ORDER_KEY = "kanbanColumnOrder";

/**
 * Get kanban column order from workspace state with Zod validation
 */
export async function getKanbanColumnOrder(
	context: vscode.ExtensionContext,
): Promise<ColumnOrder | null> {
	const data = context.workspaceState.get<unknown>(KANBAN_COLUMN_ORDER_KEY);
	if (!data) return null;

	try {
		return kanbanColumnOrderSchema.parse(data);
	} catch (error) {
		console.error("Failed to validate kanban column order:", error);
		return null;
	}
}

/**
 * Save kanban column order to workspace state with Zod validation
 */
export async function saveKanbanColumnOrder(
	context: vscode.ExtensionContext,
	columnOrder: ColumnOrder,
): Promise<ColumnOrder> {
	// Validate with Zod
	const validatedOrder = kanbanColumnOrderSchema.parse(columnOrder);

	// Store column order
	await context.workspaceState.update(KANBAN_COLUMN_ORDER_KEY, validatedOrder);

	return validatedOrder;
}

/**
 * Get todos organised by kanban columns based on stored order
 */
export async function getKanbanTodosByColumns(
	context: vscode.ExtensionContext,
): Promise<{ todo: Todo[]; "in-progress": Todo[]; done: Todo[] }> {
	const allTodos = await getAllTodos(context);
	const columnOrder = await getKanbanColumnOrder(context);

	if (!columnOrder) {
		// No stored order - organize todos by their status property
		return {
			todo: allTodos.filter((t) => t.status === "todo"),
			"in-progress": allTodos.filter((t) => t.status === "in-progress"),
			done: allTodos.filter((t) => t.status === "done"),
		};
	}

	const todoMap = new Map(allTodos.map((t) => [t.id, t]));

	return {
		todo: columnOrder.todo
			.map((id) => todoMap.get(id))
			.filter((t): t is Todo => t !== undefined),
		"in-progress": columnOrder["in-progress"]
			.map((id) => todoMap.get(id))
			.filter((t): t is Todo => t !== undefined),
		done: columnOrder.done
			.map((id) => todoMap.get(id))
			.filter((t): t is Todo => t !== undefined),
	};
}
