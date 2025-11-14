import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useEffect, useState } from "react";
import type { Todo } from "../../../src/storage/schema";
import { Drawer } from "../components/Drawer";
import { IconButton } from "../components/IconButton";
import { Modal } from "../components/Modal";
import { CalendarColumn } from "../layout/CalendarColumn";
import { CalendarDragDrop } from "../layout/CalendarDragDrop";
import { TodoDetails } from "../layout/TodoDetails";
import { formatWeekMonth } from "../utils/formatWeekMonth";
import { useInvalidateTodos } from "../utils/invalidateTodos";
import { wrpc } from "../wrpc";

dayjs.extend(isoWeek);

export function CalendarView() {
	const { data: workspaceState } = wrpc.useQuery(
		"workspaceState.getWorkspaceState",
	);

	const qc = wrpc.useUtils();
	const updateWeek = wrpc.useMutation("workspaceState.updateCalendarWeek", {
		onSuccess: () => qc.invalidate("workspaceState.getWorkspaceState"),
	});

	// Derive currentWeekStart from workspace state (not a state variable)
	const currentWeekStart = workspaceState?.calendarWeek
		? dayjs(workspaceState.calendarWeek).startOf("week")
		: dayjs().startOf("week");

	const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
	const [createdTodoId, setCreatedTodoId] = useState<string | null>(null);

	const invalidateTodos = useInvalidateTodos();
	const storeTodo = wrpc.useMutation("todo.storeTodo", {
		onSuccess: (newTodo) => {
			invalidateTodos();
			setCreatedTodoId(newTodo.id);
		},
	});

	const handleOpenDetails = (todo: Todo) => {
		setSelectedTodoId(todo.id);
	};

	const goToPreviousWeek = () => {
		const newWeek = currentWeekStart.subtract(1, "week");
		updateWeek.mutate({ week: newWeek.toISOString() });
	};

	const goToToday = () => {
		const newWeek = dayjs().startOf("week");
		updateWeek.mutate({ week: newWeek.toISOString() });
	};

	const goToNextWeek = () => {
		const newWeek = currentWeekStart.add(1, "week");
		updateWeek.mutate({ week: newWeek.toISOString() });
	};

	// Generate 7 days for the week
	const weekDays = Array.from({ length: 7 }, (_, i) =>
		currentWeekStart.add(i, "day"),
	);

	const handleAddTodo = (day: dayjs.Dayjs) => {
		storeTodo.mutate({
			title: "New Task",
			status: "todo",
			priority: "medium",
			deadline: day.startOf("day").toISOString(),
		});
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
				<div className="flex items-center gap-1">
					{/* Previous week */}
					<IconButton
						iconName="codicon-chevron-left"
						onClick={goToPreviousWeek}
						title="Previous week"
					/>
					{/* Today button styled to match */}
					<button
						type="button"
						onClick={goToToday}
						className="mx-1 px-3 py-1 rounded text-white font-medium focus:outline-none border border-accent transition-colors cursor-pointer hover:text-text hover:border-text"
					>
						Today
					</button>
					{/* Next week */}
					<IconButton
						iconName="codicon-chevron-right"
						onClick={goToNextWeek}
						title="Next week"
					/>
				</div>
			</div>

			{/* Calendar Grid with Drag and Drop */}
			<CalendarDragDrop weekDays={weekDays}>
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

			{/* Modal for adding a new todo */}
			{createdTodoId && (
				<Modal
					open={!!createdTodoId}
					onClose={handleCloseModal}
					title="Add Task"
				>
					<TodoDetails todoId={createdTodoId} autoFocusTitle />
				</Modal>
			)}
		</div>
	);
}
