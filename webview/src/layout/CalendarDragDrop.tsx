import { move } from "@dnd-kit/helpers";
import { type DragDropEvents, DragDropProvider } from "@dnd-kit/react";
import type { OutputAtPath } from "@webview-rpc/shared";
import dayjs from "dayjs";
import { type ReactNode, useEffect, useRef, useState } from "react";
import type { AppRouter } from "../../../src/router/router";
import { wrpc } from "../wrpc";

type Todos = NonNullable<OutputAtPath<AppRouter, "fetchTodos">>;
type DayKey = string; // Format: YYYY-MM-DD

// Helper: find which day column currently contains a todo id
function findDayByTodoId(
	columns: Record<DayKey, Todos>,
	id: string,
): DayKey | null {
	const dayKeys = Object.keys(columns);
	return dayKeys.find((day) => columns[day].some((t) => t.id === id)) ?? null;
}

function getColumnsFromData(
	data: OutputAtPath<AppRouter, "fetchTodos"> | undefined,
	weekDays: dayjs.Dayjs[],
): Record<DayKey, NonNullable<typeof data>> {
	const columns: Record<DayKey, NonNullable<typeof data>> = {};

	for (const day of weekDays) {
		const dayKey = day.format("YYYY-MM-DD");
		columns[dayKey] =
			data?.filter((todo) => {
				if (!todo.deadline) return false;
				const todoDate = dayjs(todo.deadline);
				return todoDate.isSame(day, "day");
			}) ?? [];
	}

	return columns;
}

interface CalendarDragDropProps {
	data: OutputAtPath<AppRouter, "fetchTodos"> | undefined;
	weekDays: dayjs.Dayjs[];
	children: (todoColumns: Record<DayKey, Todos>) => ReactNode;
}

export function CalendarDragDrop({
	data,
	weekDays,
	children,
}: CalendarDragDropProps) {
	const qc = wrpc.useUtils();
	const changeDeadlineMutation = wrpc.useMutation("changeTodoDeadline", {
		onSuccess: () => {
			// Invalidate and refetch todos to ensure UI is in sync with server
			qc.invalidate("fetchTodos");
		},
	});

	const [todoColumns, setTodoColumns] = useState(() =>
		getColumnsFromData(data, weekDays),
	);

	// Keep track of the day where the drag started
	const dragFromRef = useRef<DayKey | null>(null);

	useEffect(() => {
		setTodoColumns(getColumnsFromData(data, weekDays));
	}, [data, weekDays]);

	const handleDragStart = (e: Parameters<DragDropEvents["dragstart"]>[0]) => {
		const id = String(e?.operation?.source?.id);
		dragFromRef.current = findDayByTodoId(todoColumns, id);
	};

	const handleDragOver = (e: Parameters<DragDropEvents["dragover"]>[0]) => {
		setTodoColumns((prev) => move(prev, e));
	};

	const handleDragEnd = (e: Parameters<DragDropEvents["dragend"]>[0]) => {
		const todoId = String(e?.operation?.source?.id);
		const from = dragFromRef.current;
		setTodoColumns((prev) => move(prev, e));
		const nextColumns = move(todoColumns, e);
		const to = findDayByTodoId(nextColumns, todoId);

		if (from && to && from !== to) {
			// Set the deadline to the start of the day in ISO format
			const newDeadline = dayjs(to).startOf("day").toISOString();
			changeDeadlineMutation.mutate({
				id: todoId,
				newDeadline,
			});
		}
	};

	return (
		<DragDropProvider
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
		>
			{children(todoColumns)}
		</DragDropProvider>
	);
}
