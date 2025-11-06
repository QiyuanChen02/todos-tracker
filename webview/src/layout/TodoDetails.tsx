// Use dayjs for date formatting
import dayjs from "dayjs";
import { Fragment, useId, useState } from "react";
import { Calendar } from "../components/Calendar";
import { Menu } from "../components/Menu";

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
import {
	useChangeTodoComments,
	useChangeTodoDeadline,
	useChangeTodoPriority,
	useChangeTodoStatus,
} from "../utils/changeTodoDetails";
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
	const [showCalendar, setShowCalendar] = useState(false);
	const commentsId = useId();

	const { data: todos } = wrpc.useQuery("fetchTodos");
	const todo = todos?.find((t) => t.id === todoId);
	const [comments, setComments] = useState(todo?.comments || "");

	const { handleStatusChange } = useChangeTodoStatus();
	const { handlePriorityChange } = useChangeTodoPriority();
	const { handleDeadlineChange } = useChangeTodoDeadline();
	const { handleCommentsChange } = useChangeTodoComments();

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
			component: (
				<Menu
					isOpen={showCalendar}
					onClose={() => setShowCalendar(false)}
					trigger={
						<button
							type="button"
							className="text-sm text-muted-text cursor-pointer hover:underline"
							onClick={() => setShowCalendar(!showCalendar)}
						>
							{todo.deadline ? formatDate(todo.deadline) : "Not set"}
						</button>
					}
					className="p-2"
				>
					<Calendar
						selectedDate={todo.deadline ? new Date(todo.deadline) : undefined}
						onSelect={(date) => handleDeadlineChange(todo.id, date)}
					/>
				</Menu>
			),
		},
		{
			logoName: "codicon-list-ordered",
			propertyName: "Status",
			component: (
				<Tag
					text={todo.status}
					type="status"
					options={statusOptions}
					onSelect={(newStatus) => handleStatusChange(todo.id, newStatus)}
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
					onSelect={(newPriority) => handlePriorityChange(todo.id, newPriority)}
				/>
			),
		},
	];

	return (
		<div className="flex flex-col h-full">
			<h1 className="text-2xl pb-4 font-bold text-text wrap-break-word">
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
						<div
							className="text-text min-h-6"
							key={`${prop.propertyName}-value`}
						>
							{prop.component}
						</div>
					</Fragment>
				))}
			</div>

			{/* Divider */}
			<div className="border-t border-muted-text/20 my-6" />

			{/* Comments section */}
			<div className="flex flex-col gap-2 flex-1 min-h-0">
				<textarea
					id={commentsId}
					value={comments}
					onChange={(e) => setComments(e.target.value)}
					onBlur={() => handleCommentsChange(todo.id, comments)}
					placeholder="Add any additional comments here..."
					className="w-full flex-1 text-sm text-text bg-background resize-none focus:outline-none"
				/>
			</div>
		</div>
	);
}
