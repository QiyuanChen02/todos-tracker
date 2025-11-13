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
	return columnIds.find((col) => columns[col].some((t) => t.id === id)) ?? null;
}

// Helper: sort todos based on kanban order
function sortTodosByOrder(todos: Todos, orderMap: Map<string, number>): Todos {
	return [...todos].sort((a, b) => {
		const orderA = orderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;
		const orderB = orderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;
		return orderA - orderB;
	});
}

function getColumnsFromData(
	data: OutputAtPath<AppRouter, "fetchTodos"> | undefined,
	kanbanOrders: OutputAtPath<AppRouter, "fetchKanbanOrder"> | undefined,
): Record<ColumnId, NonNullable<typeof data>> {
	const unsortedColumns = {
		todo: data?.filter((todo) => todo.status === "todo") ?? [],
		"in-progress": data?.filter((todo) => todo.status === "in-progress") ?? [],
		done: data?.filter((todo) => todo.status === "done") ?? [],
	};

	// If we have kanban orders, sort each column based on the order
	if (kanbanOrders && kanbanOrders.length > 0) {
		const columns = { ...unsortedColumns };

		for (const columnId of Object.keys(columns) as ColumnId[]) {
			const order = kanbanOrders.find((o) => o.id === columnId);
			if (order?.todoIds) {
				// Create a map of todoId -> index for efficient lookup
				const orderMap = new Map(order.todoIds.map((id, index) => [id, index]));
				columns[columnId] = sortTodosByOrder(columns[columnId], orderMap);
			}
		}

		return columns;
	}

	return unsortedColumns;
}

interface DragDropProps {
	data: OutputAtPath<AppRouter, "fetchTodos"> | undefined;
	children: (todoColumns: Record<ColumnId, Todos>) => ReactNode;
}

export function DragDrop({ data, children }: DragDropProps) {
	const qc = wrpc.useUtils();

	// Fetch kanban order from server
	const { data: kanbanOrders } = wrpc.useQuery("fetchKanbanOrder");

	const changeStatusMutation = wrpc.useMutation("changeTodoStatus", {
		onSuccess: (data) => {
			console.log("Updated todo:", data);
			qc.invalidate("fetchTodos");
		},
	});

	const updateOrderMutation = wrpc.useMutation("updateKanbanOrder", {
		onSuccess: () => {
			qc.invalidate("fetchKanbanOrder");
		},
	});

	const [todoColumns, setTodoColumns] = useState(() =>
		getColumnsFromData(data, kanbanOrders),
	);

	// Keep track of the column where the drag started
	const dragFromRef = useRef<ColumnId | null>(null);

	useEffect(() => {
		setTodoColumns(getColumnsFromData(data, kanbanOrders));
	}, [data, kanbanOrders]);

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

		// Update status if moved to a different column
		if (from && to && from !== to) {
			changeStatusMutation.mutate({
				id: todoId,
				newStatus: to,
			});
		}

		// Always update the order for affected columns
		const columnsToUpdate = new Set<ColumnId>();
		if (from) columnsToUpdate.add(from);
		if (to) columnsToUpdate.add(to);

		for (const columnId of columnsToUpdate) {
			const todoIds = nextColumns[columnId].map((todo) => todo.id);
			updateOrderMutation.mutate({
				columnId,
				todoIds,
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
