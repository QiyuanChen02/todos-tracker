import type { SchemaTypes } from "../../../src/database/schema";

type TagColor = "red" | "yellow" | "green";

export const statusColorMap: Record<SchemaTypes["todos"]["status"], TagColor> =
	{
		todo: "red",
		"in-progress": "yellow",
		done: "green",
	};

export const priorityColorMap: Record<
	SchemaTypes["todos"]["priority"],
	TagColor
> = {
	high: "red",
	medium: "yellow",
	low: "green",
};

export const colorClassMap: Record<TagColor, string> = {
	red: "border-2 border-danger",
	yellow: "border-2 border-primary",
	green: "border-2 border-success",
};
