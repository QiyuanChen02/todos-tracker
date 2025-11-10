import { initWRPC } from "@webview-rpc/host";
import type * as vscode from "vscode";
import z from "zod";
import type { Database } from "../database/createDatabase.js";
import { type Schemas, type SchemaTypes, schemas } from "../database/schema.js";

export type Context = {
	vsContext: vscode.ExtensionContext;
	db: Database<Schemas>;
};

const { router, procedure } = initWRPC.context<Context>().create();

// Helper function to update a specific field of a todo
async function updateTodoFieldHelper<T extends keyof SchemaTypes["todos"]>(
	db: Database<Schemas>,
	id: string,
	field: T,
	value: SchemaTypes["todos"][T],
) {
	const todo = await db.todos.findById(id);
	if (!todo) throw new Error("Todo not found");
	const updatedTodo = { ...todo, [field]: value };
	await db.todos.updateById(id, updatedTodo);
	return updatedTodo;
}

export const appRouter = router({
	storeTodo: procedure
		.input(schemas.todos.omit({ id: true, createdAt: true }))
		.resolve(async ({ input, ctx }) => {
			const newTodo = await ctx.db.todos.create(input);
			return newTodo;
		}),

	fetchTodos: procedure.resolve(async ({ ctx }) => {
		const todos = await ctx.db.todos.findMany();
		return todos;
	}),

	editTodo: procedure.input(schemas.todos).resolve(async ({ input, ctx }) => {
		await ctx.db.todos.updateById(input.id, input);
		return input;
	}),

	deleteTodo: procedure
		.input(schemas.todos.shape.id)
		.resolve(async ({ input, ctx }) => {
			const success = await ctx.db.todos.deleteById(input);
			return success;
		}),

	changeTodoTitle: procedure
		.input(
			z.object({
				id: schemas.todos.shape.id,
				newTitle: schemas.todos.shape.title,
			}),
		)
		.resolve(async ({ input, ctx }) => {
			return updateTodoFieldHelper(ctx.db, input.id, "title", input.newTitle);
		}),

	changeTodoStatus: procedure
		.input(
			z.object({
				id: schemas.todos.shape.id,
				newStatus: schemas.todos.shape.status,
			}),
		)
		.resolve(async ({ input, ctx }) => {
			return updateTodoFieldHelper(ctx.db, input.id, "status", input.newStatus);
		}),

	changeTodoPriority: procedure
		.input(
			z.object({
				id: schemas.todos.shape.id,
				newPriority: schemas.todos.shape.priority,
			}),
		)
		.resolve(async ({ input, ctx }) => {
			return updateTodoFieldHelper(
				ctx.db,
				input.id,
				"priority",
				input.newPriority,
			);
		}),

	changeTodoDeadline: procedure
		.input(
			z.object({
				id: schemas.todos.shape.id,
				newDeadline: schemas.todos.shape.deadline,
			}),
		)
		.resolve(async ({ input, ctx }) => {
			return updateTodoFieldHelper(
				ctx.db,
				input.id,
				"deadline",
				input.newDeadline,
			);
		}),

	changeTodoComments: procedure
		.input(
			z.object({
				id: schemas.todos.shape.id,
				newComments: schemas.todos.shape.comments,
			}),
		)
		.resolve(async ({ input, ctx }) => {
			return updateTodoFieldHelper(
				ctx.db,
				input.id,
				"comments",
				input.newComments,
			);
		}),
});

export type AppRouter = typeof appRouter;
