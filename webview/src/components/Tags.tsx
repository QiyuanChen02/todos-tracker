import { useState } from "react";
import type { Todo } from "../../../src/storage/schema";
import { cn } from "../utils/cn";
import { Menu } from "./Menu";

type TagColor = "red" | "yellow" | "green";

const statusColorMap: Record<Todo["status"], TagColor> = {
	todo: "red",
	"in-progress": "yellow",
	done: "green",
};

const priorityColorMap: Record<Todo["priority"], TagColor> = {
	high: "red",
	medium: "yellow",
	low: "green",
};

const colorClassMap: Record<TagColor, string> = {
	red: "border-2 border-danger",
	yellow: "border-2 border-primary",
	green: "border-2 border-success",
};

// Map type to allowed values
type TagTypeMap = {
	status: Todo["status"];
	priority: Todo["priority"];
};

type TagType = keyof TagTypeMap;

export type TagProps<T extends TagType = TagType> = {
	text: TagTypeMap[T];
	type: T;
	options: TagTypeMap[T][];
	onSelect: (value: TagTypeMap[T]) => void;
	disabled?: boolean;
	readOnly?: boolean; // <-- Add this line
};

export function Tag<T extends TagType>({
	text,
	type,
	options,
	onSelect,
	disabled = false,
	readOnly = false, // <-- Add this line
}: TagProps<T>) {
	const [isOpen, setIsOpen] = useState(false);

	const handleSelect = (value: TagTypeMap[T]) => {
		onSelect(value);
		setIsOpen(false);
	};

	// Get the color based on the type and text
	const colorKey =
		type === "status"
			? statusColorMap[text as Todo["status"]]
			: priorityColorMap[text as Todo["priority"]];

	const colorClass = colorClassMap[colorKey];

	if (readOnly) {
		return (
			<span
				className={cn(
					"inline-flex items-center px-4 py-1 rounded-lg text-xs border font-semibold bg-surface",
					colorClass,
				)}
			>
				{text}
			</span>
		);
	}

	return (
		<Menu
			isOpen={isOpen && !disabled}
			onClose={() => setIsOpen(false)}
			trigger={
				<button
					type="button"
					className={cn(
						"inline-flex items-center px-4 py-1 rounded-lg text-xs border font-semibold",
						colorClass,
						"cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary bg-surface",
						isOpen && "bg-surface-2",
						disabled && "pointer-events-none select-none",
					)}
					onClick={() => !disabled && setIsOpen(!isOpen)}
					disabled={disabled}
				>
					{text}
				</button>
			}
			className="min-w-[140px]"
		>
			<ul className="py-1">
				{options.map((option) => (
					<li key={option}>
						<button
							type="button"
							className={cn(
								"w-full text-left px-4 py-2 text-xs rounded-lg font-medium transition-colors hover:bg-hover",
								option === text ? colorClass : "",
								option === text ? "bg-column-bg" : "",
							)}
							onClick={() => handleSelect(option)}
							disabled={disabled}
							tabIndex={disabled ? -1 : 0}
						>
							{option}
						</button>
					</li>
				))}
			</ul>
		</Menu>
	);
}
