import { useDroppable } from "@dnd-kit/react";
import type { OutputAtPath } from "@webview-rpc/shared";
import { useState } from "react";
import type { AppRouter } from "../../../src/router/router";
import { wrpc } from "../wrpc";
import { TodoCard } from "./TodoCard";
import { TodoInput } from "./TodoInput";

interface BoardColumnProps {
	columnId: "todo" | "in-progress" | "done";
	todos: OutputAtPath<AppRouter, "fetchTodos">;
}

function getColumnTitle(columnId: "todo" | "in-progress" | "done") {
	const titles = {
		todo: "To Do",
		"in-progress": "In Progress",
		done: "Done",
	};
	return titles[columnId];
}

function getColourClass(columnId: "todo" | "in-progress" | "done") {
	const classes = {
		todo: "border-l-4 border-l-danger",
		"in-progress": "border-l-4 border-l-primary",
		done: "border-l-4 border-l-success",
	};
	return classes[columnId];
}

export function BoardColumn({ columnId, todos }: BoardColumnProps) {
	const { ref } = useDroppable({
		id: columnId,
	});

	// Local draft state for new task
	const [isCreating, setIsCreating] = useState(false);

	const qc = wrpc.useUtils();
	const storeTodo = wrpc.useMutation("storeTodo", {
		onSuccess: () => {
			setIsCreating(false);
			// Refresh todos list
			qc.invalidate("fetchTodos");
		},
		onError: (error) => console.error("Error creating todo:", error),
	});

	const startCreating = () => setIsCreating(true);
	const cancelDraft = () => setIsCreating(false);

	const saveDraft = (title: string) => {
		const t = title.trim();
		if (t.length < 2) return cancelDraft();

		storeTodo.mutate({
			id: crypto.randomUUID(),
			title: t,
			status: columnId,
			priority: "medium",
		});
	};

	return (
		<div className="flex flex-col h-full">
			<div
				className={`rounded-t-lg border border-divider bg-column-header p-4 ${getColourClass(columnId)}`}
			>
				<div className="flex items-center justify-between">
					<h2 className="text-base font-semibold text-text">
						{getColumnTitle(columnId)}
					</h2>
					<span className="px-2.5 py-0.5 rounded-full bg-surface text-xs font-medium text-muted-text">
						{todos.length}
					</span>
				</div>
			</div>

			<div
				ref={ref}
				className={`flex-1 rounded-b-lg border-l border-r border-b border-divider bg-column-bg p-4 space-y-3 overflow-y-auto min-h[400px] transition-colors`}
			>
				{todos.map((todo, index) => (
					<TodoCard
						key={todo.id}
						index={index}
						columnId={columnId}
						todo={todo}
					/>
				))}

				{isCreating && (
					<TodoInput
						placeholder="Task title..."
						submitting={storeTodo.isPending}
						onSubmit={saveDraft}
						onCancel={cancelDraft}
					/>
				)}

				{!isCreating && (
					<button
						type="button"
						onClick={startCreating}
						disabled={isCreating || storeTodo.isPending}
						className="w-full p-4 rounded-lg border border-divider bg-card text-sm text-muted-text shadow-sm hover:shadow-md hover:border-primary disabled:opacity-60 flex items-center justify-center"
						aria-label="Add new task"
					>
						+ New Task
					</button>
				)}
			</div>
		</div>
	);
}
