import { initWRPC } from "@webview-rpc/host";
import type * as vscode from "vscode";
import z from "zod";

const { router, procedure } = initWRPC.create();

const STORAGE_KEY = "quickThoughts";

async function readThoughts(store: vscode.Memento) {
	const thoughts =
		store.get<Array<{ text: string; timestamp: string }>>(STORAGE_KEY);
	return thoughts ?? [];
}

async function writeThoughts(
	store: vscode.Memento,
	thoughts: Array<{ text: string; timestamp: string }>,
) {
	await store.update(STORAGE_KEY, thoughts);
}

export const appRouter = router({
	greet: procedure
		.input(z.object({ name: z.string().min(1) }))
		.resolve(({ input }) => `Hello, ${input.name}!`),

	getThoughts: procedure.resolve(async ({ ctx }) => {
		const thoughts = await readThoughts(ctx.context.workspaceState);
		return thoughts;
	}),

	saveThought: procedure
		.input(z.object({ text: z.string().min(1).max(280) }))
		.resolve(async ({ input, ctx }) => {
			const thoughts = await readThoughts(ctx.context.workspaceState);
			thoughts.push({
				text: input.text,
				timestamp: new Date().toISOString(),
			});
			await writeThoughts(ctx.context.workspaceState, thoughts);
		}),
});

export type AppRouter = typeof appRouter;
