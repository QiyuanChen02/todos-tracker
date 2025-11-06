// Use dayjs for date formatting
import dayjs from "dayjs";
import { Fragment } from "react/jsx-runtime";

// Helper to format ISO date to user-friendly string using dayjs
function formatDate(dateString?: string) {
	if (!dateString) return "Not set";
	const date = dayjs(dateString);
	if (!date.isValid()) return "Invalid date";
	return date.format("MMMM D, YYYY");
}

import type { SchemaTypes } from "../../../src/database/schema";
import { todoSchema } from "../../../src/database/schema";
import { Tag } from "../components/Tags";
import { wrpc } from "../wrpc";

type Properties = {
	logoName: string;
	propertyName: string;
	component: React.ReactNode;
};

// Extract the literal types from the schema
type TodoStatus = SchemaTypes["todos"]["status"];
type TodoPriority = SchemaTypes["todos"]["priority"];

const statusOptions: TodoStatus[] = todoSchema.shape.status.options;
const priorityOptions: TodoPriority[] = todoSchema.shape.priority.options;

type TodoDetailsProps = {
	todoId: string;
};

export function TodoDetails({ todoId }: TodoDetailsProps) {
	const qc = wrpc.useUtils();

	const { data: todos } = wrpc.useQuery("fetchTodos");
	const todo = todos?.find((t) => t.id === todoId);

	const changeStatusMutation = wrpc.useMutation("changeTodoStatus", {
		onSuccess: () => {
			qc.invalidate("fetchTodos");
		},
	});
	const changePriorityMutation = wrpc.useMutation("changeTodoPriority", {
		onSuccess: () => {
			qc.invalidate("fetchTodos");
		},
	});

	const handleStatusChange = (newStatus: TodoStatus) => {
		if (todo) changeStatusMutation.mutate({ id: todo.id, newStatus });
	};

	const handlePriorityChange = (newPriority: TodoPriority) => {
		if (todo) changePriorityMutation.mutate({ id: todo.id, newPriority });
	};

	if (!todo) return null;

	const properties: Properties[] = [
		{
			logoName: "codicon-calendar",
			propertyName: "Date Created",
			component: (
				<p className="text-sm text-muted-text">{formatDate(todo.createdAt)}</p>
			),
		},
		{
			logoName: "codicon-clock",
			propertyName: "Deadline",
			component: <p className="text-sm text-muted-text">Not set</p>,
		},
		{
			logoName: "codicon-list-ordered",
			propertyName: "Status",
			component: (
				<Tag
					text={todo.status}
					type="status"
					options={statusOptions}
					onSelect={handleStatusChange}
				/>
			),
		},
		{
			logoName: "codicon-flame",
			propertyName: "Priority",
			component: (
				<Tag
					text={todo.priority}
					type="priority"
					options={priorityOptions}
					onSelect={handlePriorityChange}
				/>
			),
		},
		{
			logoName: "codicon-comment",
			propertyName: "Comments",
			component: todo.comments ? (
				<p className="text-sm text-text whitespace-pre-wrap wrap-break-word">
					{todo.comments}
				</p>
			) : (
				<p className="text-sm text-muted-text">No comments</p>
			),
		},
	];

	return (
		<>
			<h1 className="text-2xl font-bold text-text wrap-break-word">
				{todo.title}
			</h1>
			{/* Properties grid */}
			<div className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-4 pt-2">
				{properties.map((prop) => (
					<Fragment key={prop.propertyName}>
						<div
							key={`${prop.propertyName}-label`}
							className="flex items-center gap-2 whitespace-nowrap"
						>
							<i
								className={`codicon ${prop.logoName} text-muted-text text-sm`}
							/>
							<span className="text-xs uppercase tracking-wide text-muted-text font-semibold">
								{prop.propertyName}
							</span>
						</div>
						<div className="text-text" key={`${prop.propertyName}-value`}>
							{prop.component}
						</div>
					</Fragment>
				))}
			</div>
		</>
	);
}
