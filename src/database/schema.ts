import z from "zod";

export const todoSchema = z.object({
	id: z.uuid(),
	title: z.string().min(2).max(100),
	status: z.enum(["todo", "in-progress", "done"]),
	priority: z.enum(["low", "medium", "high"]),
	comments: z.string().optional(),
});

export const columnsSchema = z.object({
	id: z.uuid(),
	todo: todoSchema.array(),
	"in-progress": todoSchema.array(),
	done: todoSchema.array(),
});

// Define all your schemas here
export const schemas = {
	todos: todoSchema,
	columns: columnsSchema,
	// Add more schemas here as needed
	// users: userSchema,
	// projects: projectSchema,
} as const;

export type Schemas = typeof schemas;

// Extract types for all schemas
export type SchemaTypes = {
	[K in keyof typeof schemas]: z.infer<(typeof schemas)[K]>;
};
