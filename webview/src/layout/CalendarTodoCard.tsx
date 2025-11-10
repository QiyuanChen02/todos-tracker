import { useSortable } from "@dnd-kit/react/sortable";
import type { SchemaTypes } from "../../../src/database/schema";
import { IconButton } from "../components/IconButton";
import { Tag } from "../components/Tags";
import { cn } from "../utils/cn";
import { wrpc } from "../wrpc";

interface CalendarTodoCardProps {
	todo: SchemaTypes["todos"];
	index: number;
	columnId: string;
	onOpenDetails?: (todo: SchemaTypes["todos"]) => void;
}

export function CalendarTodoCard({
	todo,
	index,
	columnId,
	onOpenDetails,
}: CalendarTodoCardProps) {
	const { ref, isDragging } = useSortable({
		id: todo.id,
		index,
		group: columnId,
	});

	const qc = wrpc.useUtils();
	const changePriority = wrpc.useMutation("changeTodoPriority", {
		onSuccess: () => qc.invalidate("fetchTodos"),
	});

	const deleteTodo = wrpc.useMutation("deleteTodo", {
		onSuccess: () => qc.invalidate("fetchTodos"),
	});

	const handleClick = () => {
		if (isDragging) return;
		onOpenDetails?.(todo);
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		deleteTodo.mutate(todo.id);
	};

	return (
		// biome-ignore lint/a11y/useSemanticElements: Avoids nesting button inside button
		<div
			ref={ref}
			role="button"
			tabIndex={0}
			onClick={handleClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					handleClick();
				}
			}}
			className={cn(
				"p-2 rounded border bg-card cursor-pointer transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40 group",
				isDragging &&
					"opacity-60 scale-95 border-primary ring-2 ring-primary/30",
			)}
		>
			<div className="flex items-center justify-between mb-1">
				<h3 className="text-xs font-medium text-text line-clamp-2 flex-1">
					{todo.title}
				</h3>
				<IconButton
					iconName="codicon-trash"
					title="Delete"
					onClick={handleDelete}
					className="opacity-0 group-hover:opacity-100 transition-opacity"
				/>
			</div>
			<div className="flex items-center gap-1 mt-3">
				<Tag
					text={todo.priority}
					type="priority"
					options={["high", "medium", "low"]}
					onSelect={(priority) => {
						changePriority.mutate({ id: todo.id, newPriority: priority });
					}}
					disabled
				/>
			</div>
		</div>
	);
}
