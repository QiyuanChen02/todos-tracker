import type { OutputAtPath } from "@webview-rpc/shared";
import { useEffect, useState } from "react";
import type { SchemaTypes } from "../../../src/database/schema";
import type { AppRouter } from "../../../src/router/router";
import { Drawer } from "../components/Drawer";
import { BoardColumn } from "../layout/BoardColumn";
import { DragDrop } from "../layout/KanbanDragDrop";
import { TodoDetails } from "../layout/TodoDetails";

type ColumnId = "todo" | "in-progress" | "done";

interface KanbanViewProps {
	data: OutputAtPath<AppRouter, "fetchTodos"> | undefined;
}

export function KanbanView({ data }: KanbanViewProps) {
	const columnIds: ColumnId[] = ["todo", "in-progress", "done"];
	const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const handleCloseDrawer = () => {
		setDrawerOpen(false);
		setTimeout(() => setSelectedTodoId(null), 500);
	};

	const handleOpenDetails = (todo: SchemaTypes["todos"]) => {
		setSelectedTodoId(todo.id);
	};

	useEffect(() => {
		setDrawerOpen(!!selectedTodoId);
	}, [selectedTodoId]);

	return (
		<>
			<DragDrop data={data}>
				{(todoColumns) => (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
						{columnIds.map((columnId) => (
							<BoardColumn
								key={columnId}
								columnId={columnId}
								todos={todoColumns[columnId]}
								onOpenDetails={handleOpenDetails}
							/>
						))}
					</div>
				)}
			</DragDrop>
			<Drawer
				open={drawerOpen}
				onClose={handleCloseDrawer}
				title="Todo details"
			>
				{selectedTodoId && <TodoDetails todoId={selectedTodoId} />}
			</Drawer>
		</>
	);
}
