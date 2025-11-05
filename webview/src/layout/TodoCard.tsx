import { useSortable } from "@dnd-kit/react/sortable";
import { useState } from "react";
import type { SchemaTypes } from "../../../src/database/schema";
import { IconButton } from "../components/IconButton";
import { TodoInput } from "../components/TodoInput";
import { cn } from "../utils/cn";
import { wrpc } from "../wrpc";

type TodoCardProps = {
	index: number;
	columnId: string;
	todo: SchemaTypes["todos"];
	onOpenDetails?: (todo: SchemaTypes["todos"]) => void;
};

export function TodoCard({
	index,
	columnId,
	todo,
	onOpenDetails,
}: TodoCardProps) {
	const { ref, isDragging } = useSortable({
		id: todo.id,
		index,
		group: columnId,
	});

	const { title } = todo;

	const utils = wrpc.useUtils();
	const editTodo = wrpc.useMutation("editTodo", {
		onSuccess: () => utils.invalidate("fetchTodos"),
	});
	const deleteTodo = wrpc.useMutation("deleteTodo", {
		onSuccess: () => utils.invalidate("fetchTodos"),
	});

	const [isEditing, setIsEditing] = useState(false);

	const handleEdit = () => setIsEditing(true);

	const handleEditSave = (newTitle: string) => {
		editTodo.mutate({ ...todo, title: newTitle });
		setIsEditing(false);
	};

	const handleEditCancel = () => {
		setIsEditing(false);
	};

	const handleDelete = () => {
		deleteTodo.mutate(todo.id);
	};

	const handleOpenDetails = () => {
		if (isDragging || isEditing) return;
		onOpenDetails?.(todo);
	};

	return (
		<>
			{!isEditing && (
				// biome-ignore lint/a11y/useSemanticElements: Avoids nesting button inside button
				<div
					role="button"
					tabIndex={0}
					ref={ref}
					onClick={handleOpenDetails}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							handleOpenDetails();
						}
					}}
					className={cn(
						"relative text-left group p-4 rounded border bg-card cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-primary/40",
						isDragging &&
							"opacity-60 scale-95 border-primary ring-2 ring-primary/30",
					)}
				>
					<div className="absolute top-3 right-2 flex gap-1 opacity-0 group-hover:opacity-100 pointer-events-auto transition-opacity z-10">
						<IconButton
							iconName="codicon-edit"
							onClick={(e) => {
								e.stopPropagation();
								handleEdit();
							}}
							title="Edit todo"
							className="text-muted-text hover:text-text bg-panel-bg"
						/>
						<IconButton
							iconName="codicon-trash"
							onClick={(e) => {
								e.stopPropagation();
								handleDelete();
							}}
							title="Delete todo"
							className="text-muted-text hover:text-text bg-panel-bg"
						/>
					</div>
					<div className="space-y-3 min-h-5">
						<div className="flex items-start justify-between gap-2">
							<h3 className="text-sm font-semibold text-text flex-1 wrap-break-word">
								{title}
							</h3>
						</div>
					</div>
				</div>
			)}

			{isEditing && (
				<TodoInput
					initialValue={title}
					placeholder="Edit task..."
					submitting={editTodo.isPending}
					onSubmit={handleEditSave}
					onCancel={handleEditCancel}
				/>
			)}
		</>
	);
}
