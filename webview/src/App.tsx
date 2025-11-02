/** biome-ignore-all lint/correctness/useUniqueElementIds: Easier */

import { BoardColumn } from "./components/BoardColumn";
import { wrpc } from "./wrpc";

export default function App() {
	const { data: todos } = wrpc.useQuery("fetchTodos");

	if (!todos) {
		return <div className="p-6">Loading...</div>;
	}

	const todoItems = todos.filter((todo) => todo.status === "todo");
	const inProgressItems = todos.filter((todo) => todo.status === "in-progress");
	const doneItems = todos.filter((todo) => todo.status === "done");

	return (
		<div className="h-screen bg-background p-6">
			<div className="h-full max-w-7xl mx-auto">
				<header className="mb-6">
					<h1 className="text-2xl font-bold text-text mb-2">TODOs Tracker</h1>
					<p className="text-muted-text">
						Manage your code TODOs across your workspace
					</p>
				</header>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
					<BoardColumn
						id="todo"
						title="To Do"
						todos={todoItems}
						statusColor="todo"
					/>

					<BoardColumn
						id="in-progress"
						title="In Progress"
						todos={inProgressItems}
						statusColor="in-progress"
					/>

					<BoardColumn
						id="done"
						title="Done"
						todos={doneItems}
						statusColor="done"
					/>
				</div>
			</div>
		</div>
	);
}
