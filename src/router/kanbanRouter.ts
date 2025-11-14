import * as kanbanColumnStorage from "../storage/kanbanColumnStorage.js";
import { kanbanColumnOrderSchema } from "../storage/schema.js";
import { procedure, router } from "./base.js";

export const kanbanRouter = router({
	saveKanbanColumnOrder: procedure
		.input(kanbanColumnOrderSchema)
		.resolve(async ({ input, ctx }) => {
			return kanbanColumnStorage.saveKanbanColumnOrder(ctx.vsContext, input);
		}),

	fetchKanbanTodosByColumns: procedure.resolve(async ({ ctx }) => {
		return kanbanColumnStorage.getKanbanTodosByColumns(ctx.vsContext);
	}),
});
