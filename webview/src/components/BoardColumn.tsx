import type { OutputAtPath } from "@webview-rpc/shared";
import { useEffect, useRef, useState } from "react";
import type { AppRouter } from "../../../src/router/router";
import { wrpc } from "../wrpc";
import { TodoCard } from "./TodoCard";

interface BoardColumnProps {
	id: string;
	title: string;
	todos: OutputAtPath<AppRouter, "fetchTodos">;
	statusColor?: "todo" | "in-progress" | "done";
}

export function BoardColumn({
	title,
	todos,
	statusColor = "todo",
}: BoardColumnProps) {
	const colorClasses = {
		todo: "border-l-4 border-l-warning",
		"in-progress": "border-l-4 border-l-primary",
		done: "border-l-4 border-l-success",
	};

	// Local draft state for new task
	const [isCreating, setIsCreating] = useState(false);
	const [draftTitle, setDraftTitle] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isCreating) {
			// ensure focus after render
			setTimeout(() => inputRef.current?.focus(), 0);
		}
	}, [isCreating]);

	const qc = wrpc.useUtils();
	const storeTodo = wrpc.useMutation("storeTodo", {
		onSuccess: () => {
			setIsCreating(false);
			setDraftTitle("");
			// Refresh todos list
			qc.invalidate("fetchTodos");
		},
	});

	const startCreating = () => {
		setIsCreating(true);
		setDraftTitle("");
	};

	const cancelDraft = () => {
		setIsCreating(false);
		setDraftTitle("");
	};

	const saveDraft = () => {
		const title = draftTitle.trim();
		// Enforce schema min length (2). If too short, just cancel silently.
		if (title.length < 2) return cancelDraft();

		storeTodo.mutate({
			id: crypto.randomUUID(),
			title,
			status: statusColor,
			priority: "medium",
		});
	};

	return (
		<div className="flex flex-col h-full">
			<div
				className={`rounded-t-lg border border-divider bg-column-header p-4 ${colorClasses[statusColor]}`}
			>
				<div className="flex items-center justify-between">
					<h2 className="text-base font-semibold text-text">{title}</h2>
					<span className="px-2.5 py-0.5 rounded-full bg-surface text-xs font-medium text-muted-text">
						{todos.length}
					</span>
				</div>
			</div>

			<div
				className={`flex-1 rounded-b-lg border-l border-r border-b border-divider bg-column-bg p-4 space-y-3 overflow-y-auto min-h-[400px] transition-colors`}
			>
				{todos.map((todo) => (
					<TodoCard key={todo.id} {...todo} />
				))}

				{isCreating && (
					<div className="p-4 rounded-lg border border-divider bg-card shadow-sm hover:shadow-md hover:border-primary focus-within:border-primary">
						<input
							ref={inputRef}
							type="text"
							className="w-full bg-transparent outline-none text-sm text-text"
							placeholder="Task title..."
							value={draftTitle}
							onChange={(e) => setDraftTitle(e.target.value)}
							onBlur={saveDraft}
							onKeyDown={(e) => {
								if (e.key === "Enter") (e.target as HTMLInputElement).blur();
								if (e.key === "Escape") cancelDraft();
							}}
							disabled={storeTodo.isPending}
						/>
					</div>
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
