import { move } from "@dnd-kit/helpers";
import { type DragDropEvents, DragDropProvider } from "@dnd-kit/react";
import type { OutputAtPath } from "@webview-rpc/shared";
import { type ReactNode, useEffect, useRef, useState } from "react";
import type { AppRouter } from "../../../src/router/router";
import { useInvalidateTodos } from "../utils/invalidateTodos";
import { wrpc } from "../wrpc";

type ColumnId = "todo" | "in-progress" | "done";
type Todos = NonNullable<OutputAtPath<AppRouter, "todo.fetchTodos">>;

// Helper: find which column currently contains a todo id
function findColumnByTodoId(
	columns: Record<ColumnId, Todos>,
	id: string,
): ColumnId | null {
	const columnIds = Object.keys(columns) as ColumnId[];
	return columnIds.find((col) => columns[col].some((t) => t.id === id)) ?? null;
}

interface DragDropProps {
	children: (todoColumns: Record<ColumnId, Todos>) => ReactNode;
}

export function DragDrop({ children }: DragDropProps) {
	const invalidateTodos = useInvalidateTodos();

	const { data: todosByColumns } = wrpc.useQuery(
		"kanban.fetchKanbanTodosByColumns",
	);

	const changeStatusMutation = wrpc.useMutation("todo.changeTodoStatus", {
		onSuccess: invalidateTodos,
	});

	const saveColumnOrderMutation = wrpc.useMutation(
		"kanban.saveKanbanColumnOrder",
	);

	const [todoColumns, setTodoColumns] = useState<Record<ColumnId, Todos>>({
		todo: [],
		"in-progress": [],
		done: [],
	});

	// Keep track of the column where the drag started
	const dragFromRef = useRef<ColumnId | null>(null);

	useEffect(() => {
		if (todosByColumns) {
			setTodoColumns(todosByColumns);
		}
	}, [todosByColumns]);

	const handleDragStart = (e: Parameters<DragDropEvents["dragstart"]>[0]) => {
		const id = String(e?.operation?.source?.id);
		dragFromRef.current = findColumnByTodoId(todoColumns, id);
	};

	const handleDragOver = (e: Parameters<DragDropEvents["dragover"]>[0]) => {
		setTodoColumns((prev) => move(prev, e));
	};

	const handleDragEnd = (e: Parameters<DragDropEvents["dragend"]>[0]) => {
		const todoId = String(e?.operation?.source?.id);
		const from = dragFromRef.current;
		const nextColumns = move(todoColumns, e);
		setTodoColumns(nextColumns);

		const to = findColumnByTodoId(nextColumns, todoId);

		// Save the new column order to backend
		saveColumnOrderMutation.mutate({
			todo: nextColumns.todo.map((t) => t.id),
			"in-progress": nextColumns["in-progress"].map((t) => t.id),
			done: nextColumns.done.map((t) => t.id),
		});

		// If status changed, update the todo's status property
		if (from && to && from !== to) {
			changeStatusMutation.mutate({
				id: todoId,
				newStatus: to,
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
