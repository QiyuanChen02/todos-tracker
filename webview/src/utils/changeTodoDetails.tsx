import type { Todo } from "../../../src/storage/schema";
import { wrpc } from "../wrpc";
import { useInvalidateTodos } from "./invalidateTodos";

type TodoStatus = Todo["status"];
type TodoPriority = Todo["priority"];

export function useChangeTodoStatus() {
	const invalidateTodos = useInvalidateTodos();
	const mutation = wrpc.useMutation("todo.changeTodoStatus", {
		onSuccess: invalidateTodos,
	});

	const handleStatusChange = (todoId: string, newStatus: TodoStatus) => {
		mutation.mutate({
			id: todoId,
			newStatus,
		});
	};

	return { handleStatusChange };
}

export function useChangeTodoPriority() {
	const invalidateTodos = useInvalidateTodos();
	const mutation = wrpc.useMutation("todo.changeTodoPriority", {
		onSuccess: invalidateTodos,
	});

	const handlePriorityChange = (todoId: string, newPriority: TodoPriority) => {
		mutation.mutate({
			id: todoId,
			newPriority,
		});
	};

	return { handlePriorityChange };
}

export function useChangeTodoDeadline() {
	const invalidateTodos = useInvalidateTodos();
	const mutation = wrpc.useMutation("todo.changeTodoDeadline", {
		onSuccess: invalidateTodos,
	});

	const handleDeadlineChange = (todoId: string, date: Date | undefined) => {
		if (date) {
			mutation.mutate({
				id: todoId,
				newDeadline: date.toISOString(),
			});
		}
	};

	return { handleDeadlineChange };
}

export function useChangeTodoComments() {
	const invalidateTodos = useInvalidateTodos();
	const mutation = wrpc.useMutation("todo.changeTodoComments", {
		onSuccess: invalidateTodos,
	});

	const handleCommentsChange = (todoId: string, comments: string) => {
		mutation.mutate({
			id: todoId,
			newComments: comments,
		});
	};

	return { handleCommentsChange };
}

export function useChangeTodoTitle() {
	const invalidateTodos = useInvalidateTodos();
	const mutation = wrpc.useMutation("todo.changeTodoTitle", {
		onSuccess: invalidateTodos,
	});

	const handleTitleChange = (todoId: string, newTitle: string) => {
		mutation.mutate({
			id: todoId,
			newTitle,
		});
	};

	return { handleTitleChange };
}
