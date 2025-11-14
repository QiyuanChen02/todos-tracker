import type * as vscode from "vscode";
import z from "zod";
import * as calendarColumnStorage from "../storage/calendarColumnStorage.js";
import * as kanbanColumnStorage from "../storage/kanbanColumnStorage.js";
import {
	type CalendarColumnOrder,
	type ColumnOrder,
	type Todo,
	todoSchema,
} from "../storage/schema.js";
import * as todoStorage from "../storage/todoStorage.js";
import { procedure, router } from "./base.js";

// Helper to extract YYYY-MM-DD from ISO datetime string
function getDateFromISO(isoString: string): string {
	return isoString.split("T")[0];
}

/**
 * Ensures a kanban column order exists, creating one from all todos if needed
 */
async function ensureKanbanColumnOrder(
	context: vscode.ExtensionContext,
): Promise<ColumnOrder> {
	let columnOrder = await kanbanColumnStorage.getKanbanColumnOrder(context);

	if (!columnOrder) {
		const allTodos = await todoStorage.getAllTodos(context);
		columnOrder = {
			todo: allTodos.filter((t) => t.status === "todo").map((t) => t.id),
			"in-progress": allTodos
				.filter((t) => t.status === "in-progress")
				.map((t) => t.id),
			done: allTodos.filter((t) => t.status === "done").map((t) => t.id),
		};
	}

	return columnOrder;
}

/**
 * Ensures a calendar column order exists, creating one from all todos if needed
 */
async function ensureCalendarColumnOrder(
	context: vscode.ExtensionContext,
): Promise<CalendarColumnOrder> {
	let columnOrder = await calendarColumnStorage.getCalendarColumnOrder(context);

	if (!columnOrder) {
		const allTodos = await todoStorage.getAllTodos(context);
		columnOrder = {};
		for (const t of allTodos) {
			if (t.deadline) {
				const dateKey = getDateFromISO(t.deadline);
				if (!columnOrder[dateKey]) {
					columnOrder[dateKey] = [];
				}
				columnOrder[dateKey].push(t.id);
			}
		}
	}

	return columnOrder;
}

/**
 * Adds a todo to the kanban column order
 */
async function addTodoToKanbanColumn(
	context: vscode.ExtensionContext,
	todoId: string,
	status: Todo["status"],
): Promise<void> {
	const columnOrder = await ensureKanbanColumnOrder(context);

	// Add todo to the appropriate column if not already present
	if (!columnOrder[status].includes(todoId)) {
		columnOrder[status] = [...columnOrder[status], todoId];
		await kanbanColumnStorage.saveKanbanColumnOrder(context, columnOrder);
	}
}

/**
 * Adds a todo to the calendar column order
 */
async function addTodoToCalendarColumn(
	context: vscode.ExtensionContext,
	todoId: string,
	deadline?: string,
): Promise<void> {
	if (!deadline) return;

	const columnOrder = await ensureCalendarColumnOrder(context);
	const dateKey = getDateFromISO(deadline);

	if (!columnOrder[dateKey]) {
		columnOrder[dateKey] = [];
	}

	if (!columnOrder[dateKey].includes(todoId)) {
		columnOrder[dateKey] = [...columnOrder[dateKey], todoId];
		await calendarColumnStorage.saveCalendarColumnOrder(context, columnOrder);
	}
}

/**
 * Moves a todo from one kanban column to another
 */
async function moveTodoInKanbanColumns(
	context: vscode.ExtensionContext,
	todoId: string,
	oldStatus: Todo["status"],
	newStatus: Todo["status"],
): Promise<void> {
	const columnOrder = await ensureKanbanColumnOrder(context);

	// Remove from old column
	const updatedOrder = {
		...columnOrder,
		[oldStatus]: columnOrder[oldStatus].filter((id) => id !== todoId),
	};

	// Add to new column
	if (!updatedOrder[newStatus].includes(todoId)) {
		updatedOrder[newStatus] = [...updatedOrder[newStatus], todoId];
	}

	await kanbanColumnStorage.saveKanbanColumnOrder(context, updatedOrder);
}

/**
 * Moves a todo from one calendar column to another
 */
async function moveTodoInCalendarColumns(
	context: vscode.ExtensionContext,
	todoId: string,
	oldDeadline?: string,
	newDeadline?: string,
): Promise<void> {
	const columnOrder = await ensureCalendarColumnOrder(context);
	const updatedOrder = { ...columnOrder };

	// Remove from old deadline column (if it had one)
	if (oldDeadline) {
		const oldDateKey = getDateFromISO(oldDeadline);
		if (updatedOrder[oldDateKey]) {
			updatedOrder[oldDateKey] = updatedOrder[oldDateKey].filter(
				(id) => id !== todoId,
			);
		}
	}

	// Add to new deadline column (if new deadline is set)
	if (newDeadline) {
		const newDateKey = getDateFromISO(newDeadline);
		if (!updatedOrder[newDateKey]) {
			updatedOrder[newDateKey] = [];
		}
		if (!updatedOrder[newDateKey].includes(todoId)) {
			updatedOrder[newDateKey] = [...updatedOrder[newDateKey], todoId];
		}
	}

	await calendarColumnStorage.saveCalendarColumnOrder(context, updatedOrder);
}

export const todoRouter = router({
	storeTodo: procedure
		.input(todoSchema.omit({ id: true, createdAt: true }))
		.resolve(async ({ input, ctx }) => {
			const newTodo = await todoStorage.createTodo(ctx.vsContext, input);

			// Add to kanban column order
			await addTodoToKanbanColumn(ctx.vsContext, newTodo.id, newTodo.status);

			// Add to calendar column order if it has a deadline
			if (newTodo.deadline) {
				await addTodoToCalendarColumn(
					ctx.vsContext,
					newTodo.id,
					newTodo.deadline,
				);
			}

			return newTodo;
		}),

	fetchTodos: procedure.resolve(async ({ ctx }) => {
		const todos = await todoStorage.getAllTodos(ctx.vsContext);
		return todos;
	}),

	editTodo: procedure.input(todoSchema).resolve(async ({ input, ctx }) => {
		await todoStorage.updateTodo(ctx.vsContext, input.id, input);
		return input;
	}),

	deleteTodo: procedure
		.input(todoSchema.shape.id)
		.resolve(async ({ input, ctx }) => {
			const success = await todoStorage.deleteTodo(ctx.vsContext, input);
			return success;
		}),

	changeTodoTitle: procedure
		.input(
			z.object({
				id: todoSchema.shape.id,
				newTitle: todoSchema.shape.title,
			}),
		)
		.resolve(async ({ input, ctx }) => {
			return todoStorage.updateTodoField(
				ctx.vsContext,
				input.id,
				"title",
				input.newTitle,
			);
		}),

	changeTodoStatus: procedure
		.input(
			z.object({
				id: todoSchema.shape.id,
				newStatus: todoSchema.shape.status,
			}),
		)
		.resolve(async ({ input, ctx }) => {
			// Get the todo to check its old status
			const todo = await todoStorage.getTodoById(ctx.vsContext, input.id);
			if (!todo) {
				throw new Error("Todo not found");
			}

			// Update the todo status
			const updatedTodo = await todoStorage.updateTodoField(
				ctx.vsContext,
				input.id,
				"status",
				input.newStatus,
			);

			// Update kanban column order
			await moveTodoInKanbanColumns(
				ctx.vsContext,
				input.id,
				todo.status,
				input.newStatus,
			);

			return updatedTodo;
		}),

	changeTodoPriority: procedure
		.input(
			z.object({
				id: todoSchema.shape.id,
				newPriority: todoSchema.shape.priority,
			}),
		)
		.resolve(async ({ input, ctx }) => {
			return todoStorage.updateTodoField(
				ctx.vsContext,
				input.id,
				"priority",
				input.newPriority,
			);
		}),

	changeTodoDeadline: procedure
		.input(
			z.object({
				id: todoSchema.shape.id,
				newDeadline: todoSchema.shape.deadline,
			}),
		)
		.resolve(async ({ input, ctx }) => {
			// Get the todo to check its old deadline
			const todo = await todoStorage.getTodoById(ctx.vsContext, input.id);
			if (!todo) {
				throw new Error("Todo not found");
			}

			// Update the todo deadline
			const updatedTodo = await todoStorage.updateTodoField(
				ctx.vsContext,
				input.id,
				"deadline",
				input.newDeadline,
			);

			// Update calendar column order
			await moveTodoInCalendarColumns(
				ctx.vsContext,
				input.id,
				todo.deadline,
				input.newDeadline,
			);

			return updatedTodo;
		}),

	changeTodoComments: procedure
		.input(
			z.object({
				id: todoSchema.shape.id,
				newComments: todoSchema.shape.comments,
			}),
		)
		.resolve(async ({ input, ctx }) => {
			return todoStorage.updateTodoField(
				ctx.vsContext,
				input.id,
				"comments",
				input.newComments,
			);
		}),
});
