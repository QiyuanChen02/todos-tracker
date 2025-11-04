import { useSortable } from "@dnd-kit/react/sortable";
import { useState } from "react";
import type { SchemaTypes } from "../../../src/database/schema";
import { wrpc } from "../wrpc";
import { IconButton } from "./IconButton";
import { TodoInput } from "./TodoInput";

export function TodoCard({
	index,
	columnId,
	todo,
}: {
	index: number;
	columnId: string;
	todo: SchemaTypes["todos"];
}) {
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
		const trimmed = newTitle.trim();
		if (trimmed.length > 1) {
			editTodo.mutate({ ...todo, title: trimmed });
			setIsEditing(false);
		}
	};

	const handleEditCancel = () => {
		setIsEditing(false);
	};

	const handleDelete = () => {
		deleteTodo.mutate(todo.id);
	};

	return (
		<>
			{!isEditing && (
				<div
					ref={ref}
					className={`relative group p-4 rounded border bg-card cursor-grab transition
                ${isDragging ? "opacity-60 scale-95 border-primary ring-2 ring-primary/30" : ""}
            `}
				>
					<div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 pointer-events-auto transition-opacity z-10">
						<IconButton
							iconName="codicon-edit"
							onClick={handleEdit}
							title="Edit todo"
							className="text-muted-text hover:text-text"
						/>
						<IconButton
							iconName="codicon-trash"
							onClick={handleDelete}
							title="Delete todo"
							className="text-muted-text hover:text-text"
						/>
					</div>
					<div className="space-y-3">
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
