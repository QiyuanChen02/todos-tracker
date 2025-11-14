import { useDroppable } from "@dnd-kit/react";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { Todo } from "../../../src/storage/schema";
import { cn } from "../utils/cn";
import { CalendarTodoCard } from "./CalendarTodoCard";

interface CalendarColumnProps {
	day: Dayjs;
	todos: Todo[];
	onOpenDetails?: (todo: Todo) => void;
	onAddTodo?: (day: Dayjs) => void;
	isFirst: boolean;
	isLast: boolean;
}

export function CalendarColumn({
	day,
	todos,
	onOpenDetails,
	onAddTodo,
	isFirst,
	isLast,
}: CalendarColumnProps) {
	const isToday = day.isSame(dayjs(), "day");
	const dayKey = day.format("YYYY-MM-DD");

	const { ref } = useDroppable({
		id: dayKey,
	});

	return (
		<div
			className={cn(
				"flex flex-col h-full border border-divider overflow-hidden",
				isFirst && "rounded-l-lg",
				isLast && "rounded-r-lg",
			)}
		>
			{/* Day header */}
			<div
				className={cn(
					"p-2 border-b border-divider bg-column-header flex items-center justify-between gap-2",
					isToday && "bg-accent/10 border-accent",
				)}
			>
				<div className="flex items-center gap-2 flex-1">
					<div className="text-xs font-medium text-muted-text uppercase">
						{day.format("ddd")}
					</div>
					<div
						className={cn(
							"text-lg font-semibold text-text",
							isToday && "text-accent",
						)}
					>
						{day.format("D")}
					</div>
				</div>
				{onAddTodo && (
					<button
						type="button"
						onClick={() => onAddTodo(day)}
						className="p-1 rounded text-muted-text hover:text-text cursor-pointer"
						aria-label="Add new task"
						title="Add new task"
					>
						<i className="codicon codicon-add text-sm" />
					</button>
				)}
			</div>

			{/* Todos list */}
			<div
				ref={ref}
				className="flex-1 p-2 bg-column-bg overflow-y-auto space-y-2"
			>
				   {/* Runtime check for duplicate IDs */}
				   {(() => {
					   const seen = new Set();
					   for (const t of todos) {
						   if (seen.has(t.id)) {
							   // eslint-disable-next-line no-console
							   console.error("Duplicate todo id in column", dayKey, t.id, todos);
						   }
						   seen.add(t.id);
					   }
					   return null;
				   })()}
				   {todos.map((todo) => (
					   <CalendarTodoCard
						   key={todo.id}
						   todo={todo}
						   columnId={dayKey}
						   onOpenDetails={onOpenDetails}
					   />
				   ))}
			</div>
		</div>
	);
}
