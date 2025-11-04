import { move } from "@dnd-kit/helpers";
import { type DragDropEvents, DragDropProvider } from "@dnd-kit/react";
import type { OutputAtPath } from "@webview-rpc/shared";
import { useEffect, useRef, useState } from "react";
import type { AppRouter } from "../../src/router/router";
import { BoardColumn } from "./components/BoardColumn";
import { wrpc } from "./wrpc";

type ColumnId = "todo" | "in-progress" | "done";

const COLUMN_IDS: ColumnId[] = ["todo", "in-progress", "done"];

// Helper: find which column currently contains a todo id
type Todos = NonNullable<OutputAtPath<AppRouter, "fetchTodos">>;
function findColumnByTodoId(
	columns: Record<ColumnId, Todos>,
	id: string,
): ColumnId | null {
	return (
		COLUMN_IDS.find((col) => columns[col].some((t) => String(t.id) === id)) ??
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

export default function App() {
	const { data } = wrpc.useQuery("fetchTodos");

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
		<div className="h-screen bg-background p-6">
			<div className="h-full max-w-7xl mx-auto">
				<header className="mb-6">
					<h1 className="text-2xl font-bold text-text mb-2">TODOs Tracker</h1>
					<p className="text-muted-text">
						Manage your code TODOs across your workspace
					</p>
				</header>

				<DragDropProvider
					onDragStart={handleDragStart}
					onDragOver={handleDragOver}
					onDragEnd={handleDragEnd}
				>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
						{COLUMN_IDS.map((columnId) => (
							<BoardColumn
								key={columnId}
								columnId={columnId}
								todos={todoColumns[columnId]}
							/>
						))}
					</div>
				</DragDropProvider>
			</div>
		</div>
	);
}
