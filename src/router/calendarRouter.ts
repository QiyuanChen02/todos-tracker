import z from "zod";
import * as calendarColumnStorage from "../storage/calendarColumnStorage.js";
import { calendarColumnOrderSchema } from "../storage/schema.js";
import { procedure, router } from "./base.js";

export const calendarRouter = router({
	saveCalendarColumnOrder: procedure
		.input(calendarColumnOrderSchema)
		.resolve(async ({ input, ctx }) => {
			return calendarColumnStorage.saveCalendarColumnOrder(
				ctx.vsContext,
				input,
			);
		}),

	fetchCalendarTodosByColumns: procedure
		.input(z.object({ weekDays: z.array(z.string()) }))
		.resolve(async ({ input, ctx }) => {
			return calendarColumnStorage.getCalendarTodosByColumns(
				ctx.vsContext,
				input.weekDays,
			);
		}),
});
