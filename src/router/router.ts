import { initWRPC } from "@webview-rpc/host";
import type * as vscode from "vscode";
import z from "zod";
import type { Database } from "../database/createDatabase.js";
import { type Schemas, schemas } from "../database/schema.js";

export type Context = {
	vsContext: vscode.ExtensionContext;
	db: Database<Schemas>;
};

const { router, procedure } = initWRPC.context<Context>().create();

export const appRouter = router({
	storeTodo: procedure.input(schemas.todos).resolve(async ({ input, ctx }) => {
		await ctx.db.todos.create(input);
		return input;
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

	changeTodoStatus: procedure
		.input(
			z.object({
				id: z.string(),
				newStatus: z.enum(["todo", "in-progress", "done"]),
			}),
		)
		.resolve(async ({ input, ctx }) => {
			const todo = await ctx.db.todos.findById(input.id);
			if (!todo) {
				throw new Error("Todo not found");
			}
			const updatedTodo = { ...todo, status: input.newStatus };
			await ctx.db.todos.updateById(input.id, updatedTodo);
			return todo;
		}),
});

export type AppRouter = typeof appRouter;
