import { move } from "@dnd-kit/helpers";
import { type DragDropEvents, DragDropProvider } from "@dnd-kit/react";
import type { OutputAtPath } from "@webview-rpc/shared";
import { type ReactNode, useEffect, useRef, useState } from "react";
import type { AppRouter } from "../../../src/router/router";
import { wrpc } from "../wrpc";

type ColumnId = "todo" | "in-progress" | "done";
type Todos = NonNullable<OutputAtPath<AppRouter, "fetchTodos">>;

// Helper: find which column currently contains a todo id
function findColumnByTodoId(
	columns: Record<ColumnId, Todos>,
	id: string,
): ColumnId | null {
	const columnIds = Object.keys(columns) as ColumnId[];
	return (
		columnIds.find((col) => columns[col].some((t) => String(t.id) === id)) ??
		null
	);
}

function getColumnsFromData(
	data: OutputAtPath<AppRouter, "fetchTodos"> | undefined,
): Record<ColumnId, NonNullable<typeof data>> {
	return {
		todo: data?.filter((todo) => todo.status === "todo") ?? [],
		"in-progress": data?.filter((todo) => todo.status === "in-progress") ?? [],
		done: data?.filter((todo) => todo.status === "done") ?? [],
	};
}

interface DragDropProps {
	data: OutputAtPath<AppRouter, "fetchTodos"> | undefined;
	children: (todoColumns: Record<ColumnId, Todos>) => ReactNode;
}

export function DragDrop({ data, children }: DragDropProps) {
	const changeTodoStatus = wrpc.useMutation("changeTodoStatus", {
		onSuccess: (data) => console.log("Updated todo:", data),
	});

	const [todoColumns, setTodoColumns] = useState(() =>
		getColumnsFromData(data),
	);

	// Keep track of the column where the drag started
	const dragFromRef = useRef<ColumnId | null>(null);

	useEffect(() => {
		setTodoColumns(getColumnsFromData(data));
	}, [data]);

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
		setTodoColumns((prev) => move(prev, e));
		const nextColumns = move(todoColumns, e);
		const to = findColumnByTodoId(nextColumns, todoId);
		if (from && to && from !== to) {
			changeTodoStatus.mutate({
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
