import type { SchemaTypes } from "../../../src/database/schema";
import { wrpc } from "../wrpc";

type TodoStatus = SchemaTypes["todos"]["status"];
type TodoPriority = SchemaTypes["todos"]["priority"];

export function useChangeTodoStatus() {
	const qc = wrpc.useUtils();
	const mutation = wrpc.useMutation("changeTodoStatus", {
		onSuccess: () => {
			qc.invalidate("fetchTodos");
		},
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
	const qc = wrpc.useUtils();
	const mutation = wrpc.useMutation("changeTodoPriority", {
		onSuccess: () => {
			qc.invalidate("fetchTodos");
		},
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
	const qc = wrpc.useUtils();
	const mutation = wrpc.useMutation("changeTodoDeadline", {
		onSuccess: () => {
			qc.invalidate("fetchTodos");
		},
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
	const qc = wrpc.useUtils();
	const mutation = wrpc.useMutation("changeTodoComments", {
		onSuccess: () => {
			qc.invalidate("fetchTodos");
		},
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
	const qc = wrpc.useUtils();
	const mutation = wrpc.useMutation("changeTodoTitle", {
		onSuccess: () => {
			qc.invalidate("fetchTodos");
		},
	});

	const handleTitleChange = (todoId: string, newTitle: string) => {
		mutation.mutate({
			id: todoId,
			newTitle,
		});
	};

	return { handleTitleChange };
}
