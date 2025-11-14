import { useEffect, useState } from "react";
import type { Todo } from "../../../src/storage/schema";
import { Drawer } from "../components/Drawer";
import { BoardColumn } from "../layout/BoardColumn";
import { DragDrop } from "../layout/KanbanDragDrop";
import { TodoDetails } from "../layout/TodoDetails";

type ColumnId = "todo" | "in-progress" | "done";

export function KanbanView() {
	const columnIds: ColumnId[] = ["todo", "in-progress", "done"];
	const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const handleCloseDrawer = () => {
		setDrawerOpen(false);
		setTimeout(() => setSelectedTodoId(null), 500);
	};

	const handleOpenDetails = (todo: Todo) => {
		setSelectedTodoId(todo.id);
	};

	useEffect(() => {
		setDrawerOpen(!!selectedTodoId);
	}, [selectedTodoId]);

	return (
		<>
			<DragDrop>
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
