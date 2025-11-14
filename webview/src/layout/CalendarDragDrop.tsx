import { move } from "@dnd-kit/helpers";
import { type DragDropEvents, DragDropProvider } from "@dnd-kit/react";
import type { OutputAtPath } from "@webview-rpc/shared";
import dayjs from "dayjs";
import { type ReactNode, useEffect, useRef, useState } from "react";
import type { AppRouter } from "../../../src/router/router";
import { useInvalidateTodos } from "../utils/invalidateTodos";
import { wrpc } from "../wrpc";

type Todos = NonNullable<OutputAtPath<AppRouter, "todo.fetchTodos">>;
type DayKey = string; // Format: YYYY-MM-DD

// Helper: find which day column currently contains a todo id
function findDayByTodoId(
	columns: Record<DayKey, Todos>,
	id: string,
): DayKey | null {
	const dayKeys = Object.keys(columns);
	return dayKeys.find((day) => columns[day].some((t) => t.id === id)) ?? null;
}

interface CalendarDragDropProps {
	weekDays: dayjs.Dayjs[];
	children: (todoColumns: Record<DayKey, Todos>) => ReactNode;
}

export function CalendarDragDrop({
	weekDays,
	children,
}: CalendarDragDropProps) {
	const invalidateTodos = useInvalidateTodos();

	// Convert weekDays to array of YYYY-MM-DD strings
	const weekDayKeys = weekDays.map((day) => day.format("YYYY-MM-DD"));

	// Fetch todos organized by calendar columns (uses stored order if available)
	const { data: todosByColumns } = wrpc.useQuery(
		"calendar.fetchCalendarTodosByColumns",
		{
			weekDays: weekDayKeys,
		},
	);

	const changeDeadlineMutation = wrpc.useMutation("todo.changeTodoDeadline");

	const saveColumnOrderMutation = wrpc.useMutation(
		"calendar.saveCalendarColumnOrder",
	);

	const [todoColumns, setTodoColumns] = useState<Record<DayKey, Todos>>({});

	// Keep track of the day where the drag started and if we're actively dragging
	const dragFromRef = useRef<DayKey | null>(null);
	const isDraggingRef = useRef(false);

	useEffect(() => {
		// Don't update columns from server if we're in the middle of a drag operation
		if (todosByColumns && !isDraggingRef.current) {
			setTodoColumns(todosByColumns);
		}
	}, [todosByColumns]);

	const handleDragStart = (e: Parameters<DragDropEvents["dragstart"]>[0]) => {
		const id = String(e?.operation?.source?.id);
		isDraggingRef.current = true;
		dragFromRef.current = findDayByTodoId(todoColumns, id);
	};

	const handleDragOver = (e: Parameters<DragDropEvents["dragover"]>[0]) => {
		setTodoColumns((prev) => move(prev, e));
	};

	const handleDragEnd = (e: Parameters<DragDropEvents["dragend"]>[0]) => {
		const todoId = String(e?.operation?.source?.id);
		const from = dragFromRef.current;
		const nextColumns = move(todoColumns, e);

		// Optimistically update local state
		setTodoColumns(nextColumns);

		const to = findDayByTodoId(nextColumns, todoId);

		// Save the new column order to backend
		const columnOrderToSave: Record<string, string[]> = {};
		for (const [dayKey, todos] of Object.entries(nextColumns)) {
			columnOrderToSave[dayKey] = todos.map((t) => t.id);
		}
		saveColumnOrderMutation.mutate(columnOrderToSave);

		// If day changed, update the todo's deadline property
		if (from && to && from !== to) {
			// Set the deadline to the start of the day in ISO format
			const newDeadline = dayjs(to).startOf("day").toISOString();
			changeDeadlineMutation.mutate(
				{
					id: todoId,
					newDeadline,
				},
				{
					onSuccess: () => {
						// Invalidate after drag completes
						invalidateTodos();
					},
				},
			);
		}

		// Reset drag state
		isDraggingRef.current = false;
		dragFromRef.current = null;
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
