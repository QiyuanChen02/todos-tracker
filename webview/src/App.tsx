/** biome-ignore-all lint/correctness/useUniqueElementIds: Easier */

import type { TodoItem } from "../../src/commands/scanTodos";
import { BoardColumn } from "./components/BoardColumn";
import { TodoCard } from "./components/TodoCard";
import { useUpdates } from "./hooks/useUpdates";
import { wrpc } from "./wrpc";

interface TodoWithStatus extends TodoItem {
	status: "todo" | "in-progress" | "done";
}

export default function App() {
	// Mock data - replace with actual data from your extension
	const { data, refetch } = wrpc.useQuery("fetchTodos", undefined);

	// Update: Use data directly instead of storing in separate state
	const todos: TodoWithStatus[] = data
		? data.map((todo) => ({
				...todo,
				status: "todo" as const,
			}))
		: [];

	useUpdates(refetch, "todosUpdated");

	// Filter todos by status
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
						count={todoItems.length}
						statusColor="todo"
					>
						{todoItems.map((todo) => (
							<TodoCard key={todo.id} {...todo} />
						))}
					</BoardColumn>

					<BoardColumn
						id="in-progress"
						title="In Progress"
						count={inProgressItems.length}
						statusColor="in-progress"
					>
						{inProgressItems.map((todo) => (
							<TodoCard key={todo.id} {...todo} />
						))}
					</BoardColumn>

					<BoardColumn
						id="done"
						title="Done"
						count={doneItems.length}
						statusColor="done"
					>
						{doneItems.map((todo) => (
							<TodoCard key={todo.id} {...todo} />
						))}
					</BoardColumn>
				</div>
			</div>
		</div>
	);
}
