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

export type Todo = z.infer<typeof todoSchema>;

export const kanbanColumnOrderSchema = z.object({
	todo: z.array(z.string()),
	"in-progress": z.array(z.string()),
	done: z.array(z.string()),
});

export type ColumnOrder = z.infer<typeof kanbanColumnOrderSchema>;

// Calendar column order: keys are date strings (YYYY-MM-DD), values are arrays of todo IDs
export const calendarColumnOrderSchema = z.record(
	z.string(),
	z.array(z.string()),
);

export type CalendarColumnOrder = z.infer<typeof calendarColumnOrderSchema>;

// Workspace state: persists UI state like current tab and calendar week
export const workspaceStateSchema = z.object({
	currentTab: z.enum(["kanban", "calendar"]).optional(),
	calendarWeek: z.iso.datetime().optional(),
});

export type WorkspaceState = z.infer<typeof workspaceStateSchema>;
