import type * as vscode from "vscode";
import {
	type CalendarColumnOrder,
	calendarColumnOrderSchema,
	type Todo,
} from "./schema.js";
import { getAllTodos } from "./todoStorage.js";

const CALENDAR_COLUMN_ORDER_KEY = "calendarColumnOrder";

/**
 * Get calendar column order from workspace state with Zod validation
 */
export async function getCalendarColumnOrder(
	context: vscode.ExtensionContext,
): Promise<CalendarColumnOrder | null> {
	const data = context.workspaceState.get<unknown>(CALENDAR_COLUMN_ORDER_KEY);
	if (!data) return null;

	try {
		return calendarColumnOrderSchema.parse(data);
	} catch (error) {
		console.error("Failed to validate calendar column order:", error);
		return null;
	}
}

/**
 * Save calendar column order to workspace state with Zod validation
 */
export async function saveCalendarColumnOrder(
	context: vscode.ExtensionContext,
	columnOrder: CalendarColumnOrder,
): Promise<CalendarColumnOrder> {
	// Validate with Zod
	const validatedOrder = calendarColumnOrderSchema.parse(columnOrder);

	// Store column order
	await context.workspaceState.update(
		CALENDAR_COLUMN_ORDER_KEY,
		validatedOrder,
	);

	return validatedOrder;
}

/**
 * Get todos organized by calendar columns (days) based on stored order
 */
export async function getCalendarTodosByColumns(
	context: vscode.ExtensionContext,
	weekDays: string[], // Array of YYYY-MM-DD strings
): Promise<Record<string, Todo[]>> {
	const allTodos = await getAllTodos(context);
	const columnOrder = await getCalendarColumnOrder(context);

	if (!columnOrder) {
		const result: Record<string, Todo[]> = {};
		for (const dayKey of weekDays) {
			result[dayKey] = [];
		}
		return result;
	}

	const todoMap = new Map(allTodos.map((t) => [t.id, t]));
	const result: Record<string, Todo[]> = {};

	for (const dayKey of weekDays) {
		const todoIds = columnOrder[dayKey] || [];
		result[dayKey] = todoIds
			.map((id) => todoMap.get(id))
			.filter((t): t is Todo => t !== undefined);
	}

	return result;
}
