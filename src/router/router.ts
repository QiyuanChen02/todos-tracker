import { initWRPC } from "@webview-rpc/host";
import type * as vscode from "vscode";
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
		const todos = ctx.db.todos.findMany();
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
});

export type AppRouter = typeof appRouter;
