import { wrpc } from "../wrpc";

/**
 * Invalidates all todo-related queries to trigger a refetch
 */
export function useInvalidateTodos() {
	const qc = wrpc.useUtils();

	return () => {
		qc.invalidate("todo.fetchTodos");
		qc.invalidate("calendar.fetchCalendarTodosByColumns");
		qc.invalidate("kanban.fetchKanbanTodosByColumns");
	};
}
