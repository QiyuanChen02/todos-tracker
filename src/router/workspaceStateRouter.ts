import z from "zod";
import * as workspaceStateStorage from "../storage/workspaceStateStorage.js";
import { procedure, router } from "./base.js";

export const workspaceStateRouter = router({
	/**
	 * Get the current workspace state (tab and calendar week)
	 */
	getWorkspaceState: procedure.resolve(async ({ ctx }) => {
		const state = await workspaceStateStorage.getWorkspaceState(ctx.vsContext);
		if (!state) {
			// Return defaults if no state is stored
			return {
				currentTab: undefined,
				calendarWeek: undefined,
			};
		}
		return state;
	}),

	/**
	 * Update the current tab
	 */
	updateCurrentTab: procedure
		.input(z.object({ tab: z.enum(["kanban", "calendar"]) }))
		.resolve(async ({ input, ctx }) => {
			await workspaceStateStorage.updateWorkspaceState(ctx.vsContext, {
				currentTab: input.tab,
			});
			return { success: true };
		}),

	/**
	 * Update the calendar week
	 */
	updateCalendarWeek: procedure
		.input(z.object({ week: z.iso.datetime() }))
		.resolve(async ({ input, ctx }) => {
			await workspaceStateStorage.updateWorkspaceState(ctx.vsContext, {
				calendarWeek: input.week,
			});
			return { success: true };
		}),
});
