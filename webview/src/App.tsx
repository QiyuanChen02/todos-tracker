import { useEffect, useState } from "react";
import type { SchemaTypes } from "../../src/database/schema";
import { Drawer } from "./components/Drawer";
import { BoardColumn } from "./layout/BoardColumn";
import { DragDrop } from "./layout/DragDrop";
import { TodoDetails } from "./layout/TodoDetails";
import { wrpc } from "./wrpc";

type ColumnId = "todo" | "in-progress" | "done";

export default function App() {
	const { data } = wrpc.useQuery("fetchTodos");
	const columnIds: ColumnId[] = ["todo", "in-progress", "done"];
	const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);

	const handleCloseDrawer = () => {
		setDrawerOpen(false);
		setTimeout(() => setSelectedTodoId(null), 500);
	};

	const [drawerOpen, setDrawerOpen] = useState(false);

	useEffect(() => {
		setDrawerOpen(!!selectedTodoId);
	}, [selectedTodoId]);

	return (
		<div className="h-screen bg-background p-8">
			<div className="h-full max-w-7xl mx-auto flex flex-col">
				<header className="mb-6">
					<h1 className="text-2xl font-bold text-text mb-2">TODOs Tracker</h1>
					<p className="text-muted-text">
						Manage your code TODOs across your workspace
					</p>
				</header>

				<DragDrop data={data}>
					{(todoColumns) => (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
							{columnIds.map((columnId) => (
								<BoardColumn
									key={columnId}
									columnId={columnId}
									todos={todoColumns[columnId]}
									onOpenDetails={(t) => setSelectedTodoId(t.id)}
								/>
							))}
						</div>
					)}
				</DragDrop>
			</div>
			<Drawer
				open={drawerOpen}
				onClose={handleCloseDrawer}
				title="Todo details"
			>
				{selectedTodoId && <TodoDetails todoId={selectedTodoId} />}
			</Drawer>
		</div>
	);
}
