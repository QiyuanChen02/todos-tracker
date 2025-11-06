import z from "zod";

export const todoSchema = z.object({
	id: z.uuid(),
	title: z.string().max(1000),
	status: z.enum(["todo", "in-progress", "done"]),
	priority: z.enum(["low", "medium", "high"]),
	comments: z.string().optional(),
	deadline: z.iso.datetime().optional(),
	createdAt: z.iso.datetime(),
});

// Define all your schemas here
export const schemas = {
	todos: todoSchema,
	// Add more schemas here as needed
} as const;

export type Schemas = typeof schemas;

// Extract types for all schemas
export type SchemaTypes = {
	[K in keyof typeof schemas]: z.infer<(typeof schemas)[K]>;
};
