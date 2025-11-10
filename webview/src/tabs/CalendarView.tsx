import type { OutputAtPath } from "@webview-rpc/shared";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useState } from "react";
import type { SchemaTypes } from "../../../src/database/schema";
import type { AppRouter } from "../../../src/router/router";
import { Drawer } from "../components/Drawer";
import { Modal } from "../components/Modal";
import { CalendarColumn } from "../layout/CalendarColumn";
import { CalendarDragDrop } from "../layout/CalendarDragDrop";
import { TodoDetails } from "../layout/TodoDetails";
import { formatWeekMonth } from "../utils/formatWeekMonth";
import { wrpc } from "../wrpc";

dayjs.extend(isoWeek);

interface CalendarViewProps {
	data: OutputAtPath<AppRouter, "fetchTodos"> | undefined;
}

export function CalendarView({ data }: CalendarViewProps) {
	const [currentWeekStart, setCurrentWeekStart] = useState(() =>
		dayjs().startOf("week"),
	);
	const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
	const [createdTodoId, setCreatedTodoId] = useState<string | null>(null);

	const storeTodo = wrpc.useMutation("storeTodo");

	const handleOpenDetails = (todo: SchemaTypes["todos"]) => {
		setSelectedTodoId(todo.id);
	};

	const goToPreviousWeek = () => {
		setCurrentWeekStart((prev) => prev.subtract(1, "week"));
	};

	const goToToday = () => {
		setCurrentWeekStart(dayjs().startOf("week"));
	};

	const goToNextWeek = () => {
		setCurrentWeekStart((prev) => prev.add(1, "week"));
	};

	// Generate 7 days for the week
	const weekDays = Array.from({ length: 7 }, (_, i) =>
		currentWeekStart.add(i, "day"),
	);

	const handleAddTodo = (day: dayjs.Dayjs) => {
		storeTodo.mutate(
			{
				title: "New Task",
				status: "todo",
				priority: "medium",
				deadline: day.startOf("day").toISOString(),
			},
			{
				onSuccess: (newTodo) => {
					setCreatedTodoId(newTodo.id);
				},
			},
		);
	};

	const handleCloseDrawer = () => {
		setSelectedTodoId(null);
	};

	const handleCloseModal = () => {
		setCreatedTodoId(null);
	};

	return (
		<div className="flex flex-col h-full">
			{/* Header with navigation */}
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl font-semibold text-text">
					{formatWeekMonth(currentWeekStart)}
				</h2>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={goToPreviousWeek}
						className="px-4 py-2 rounded bg-surface text-text border border-divider hover:bg-hover transition-colors cursor-pointer"
						aria-label="Previous week"
					>
						&lt;
					</button>
					<button
						type="button"
						onClick={goToToday}
						className="px-4 py-2 rounded bg-surface text-text border border-divider hover:bg-hover transition-colors cursor-pointer"
					>
						Today
					</button>
					<button
						type="button"
						onClick={goToNextWeek}
						className="px-4 py-2 rounded bg-surface text-text border border-divider hover:bg-hover transition-colors cursor-pointer"
						aria-label="Next week"
					>
						&gt;
					</button>
				</div>
			</div>

			{/* Calendar Grid with Drag and Drop */}
			<CalendarDragDrop data={data} weekDays={weekDays}>
				{(todoColumns) => (
					<div className="grid grid-cols-7 flex-1 overflow-hidden">
						{weekDays.map((day, index) => {
							const dayKey = day.format("YYYY-MM-DD");
							return (
								<CalendarColumn
									key={dayKey}
									day={day}
									todos={todoColumns[dayKey] || []}
									onOpenDetails={handleOpenDetails}
									onAddTodo={handleAddTodo}
									isFirst={index === 0}
									isLast={index === 6}
								/>
							);
						})}
					</div>
				)}
			</CalendarDragDrop>

			{/* Drawer for viewing/editing existing todo */}
			{selectedTodoId && (
				<Drawer
					open={!!selectedTodoId}
					onClose={handleCloseDrawer}
					title="Edit Task"
				>
					<TodoDetails todoId={selectedTodoId} />
				</Drawer>
			)}

			{/* Modal for editing newly created todo */}
			{createdTodoId && (
				<Modal
					open={!!createdTodoId}
					onClose={handleCloseModal}
					title="Edit Task"
				>
					<TodoDetails todoId={createdTodoId} />
				</Modal>
			)}
		</div>
	);
}
