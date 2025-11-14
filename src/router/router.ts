import { router } from "./base.js";
import { calendarRouter } from "./calendarRouter.js";
import { kanbanRouter } from "./kanbanRouter.js";
import { todoRouter } from "./todoRouter.js";
import { workspaceStateRouter } from "./workspaceStateRouter.js";

export type { Context } from "./base.js";

export const appRouter = router({
	todo: todoRouter,
	kanban: kanbanRouter,
	calendar: calendarRouter,
	workspaceState: workspaceStateRouter,
});

export type AppRouter = typeof appRouter;
