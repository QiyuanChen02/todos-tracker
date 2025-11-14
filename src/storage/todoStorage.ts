import type * as vscode from "vscode";
import { type Todo, todoSchema } from "./schema.js";

const TODO_KEY_PREFIX = "todo:";
const TODO_IDS_KEY = "todoIds";

/**
 * Get all todo IDs from workspace state
 */
async function getTodoIds(context: vscode.ExtensionContext): Promise<string[]> {
	return context.workspaceState.get<string[]>(TODO_IDS_KEY, []);
}

/**
 * Save todo IDs to workspace state
 */
async function saveTodoIds(
	context: vscode.ExtensionContext,
	ids: string[],
): Promise<void> {
	await context.workspaceState.update(TODO_IDS_KEY, ids);
}

/**
 * Get a single todo by ID with Zod validation
 */
export async function getTodoById(
	context: vscode.ExtensionContext,
	id: string,
): Promise<Todo | null> {
	const data = context.workspaceState.get<unknown>(`${TODO_KEY_PREFIX}${id}`);
	if (!data) return null;

	try {
		return todoSchema.parse(data);
	} catch (error) {
		console.error(`Failed to validate todo ${id}:`, error);
		return null;
	}
}

/**
 * Get all todos with Zod validation
 */
export async function getAllTodos(
	context: vscode.ExtensionContext,
): Promise<Todo[]> {
	const ids = await getTodoIds(context);
	const todos: Todo[] = [];

	for (const id of ids) {
		const todo = await getTodoById(context, id);
		if (todo) {
			todos.push(todo);
		}
	}

	return todos;
}

/**
 * Create a new todo with Zod validation
 */
export async function createTodo(
	context: vscode.ExtensionContext,
	todoData: Omit<Todo, "id" | "createdAt">,
): Promise<Todo> {
	const id = crypto.randomUUID();
	const createdAt = new Date().toISOString();

	const newTodo: Todo = {
		...todoData,
		id,
		createdAt,
	};

	// Validate with Zod
	const validatedTodo = todoSchema.parse(newTodo);

	// Store todo
	await context.workspaceState.update(`${TODO_KEY_PREFIX}${id}`, validatedTodo);

	// Add to ID list
	const ids = await getTodoIds(context);
	ids.push(id);
	await saveTodoIds(context, ids);

	return validatedTodo;
}

/**
 * Update an existing todo with Zod validation
 */
export async function updateTodo(
	context: vscode.ExtensionContext,
	id: string,
	todoData: Todo,
): Promise<Todo | null> {
	const existingTodo = await getTodoById(context, id);
	if (!existingTodo) return null;

	// Validate with Zod
	const validatedTodo = todoSchema.parse(todoData);

	// Store updated todo
	await context.workspaceState.update(`${TODO_KEY_PREFIX}${id}`, validatedTodo);

	return validatedTodo;
}

/**
 * Delete a todo
 */
export async function deleteTodo(
	context: vscode.ExtensionContext,
	id: string,
): Promise<boolean> {
	const existingTodo = await getTodoById(context, id);
	if (!existingTodo) return false;

	// Remove from storage
	await context.workspaceState.update(`${TODO_KEY_PREFIX}${id}`, undefined);

	// Remove from ID list
	const ids = await getTodoIds(context);
	const newIds = ids.filter((todoId) => todoId !== id);
	await saveTodoIds(context, newIds);

	return true;
}

/**
 * Update a specific field of a todo
 */
export async function updateTodoField<K extends keyof Todo>(
	context: vscode.ExtensionContext,
	id: string,
	field: K,
	value: Todo[K],
): Promise<Todo | null> {
	const existingTodo = await getTodoById(context, id);
	if (!existingTodo) return null;

	const updatedTodo = { ...existingTodo, [field]: value };
	return updateTodo(context, id, updatedTodo);
}
