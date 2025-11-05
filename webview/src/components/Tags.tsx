import { useEffect, useRef, useState } from "react";
import type { SchemaTypes } from "../../../src/database/schema";
import { cn } from "../utils/cn";
import {
	colorClassMap,
	priorityColorMap,
	statusColorMap,
} from "../utils/colorMap";

// Map type to allowed values
type TagTypeMap = {
	status: SchemaTypes["todos"]["status"];
	priority: SchemaTypes["todos"]["priority"];
};

type TagType = keyof TagTypeMap;

export type TagProps<T extends TagType = TagType> = {
	text: TagTypeMap[T];
	type: T;
	options: TagTypeMap[T][];
	onSelect: (value: TagTypeMap[T]) => void;
};

export function Tag<T extends TagType>({
	text,
	type,
	options,
	onSelect,
}: TagProps<T>) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	const handleSelect = (value: TagTypeMap[T]) => {
		onSelect(value);
		setIsOpen(false);
	};

	// Get the color based on the type and text
	const colorKey =
		type === "status"
			? statusColorMap[text as SchemaTypes["todos"]["status"]]
			: priorityColorMap[text as SchemaTypes["todos"]["priority"]];

	const colorClass = colorClassMap[colorKey];

	return (
		<div className="relative inline-block" ref={dropdownRef}>
			<button
				type="button"
				className={cn(
					"inline-flex items-center px-4 py-1 rounded-lg text-xs border font-semibold",
					colorClass,
					"cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary bg-surface",
					isOpen && "bg-surface-2",
				)}
				onClick={() => setIsOpen(!isOpen)}
			>
				<span className="truncate">{text}</span>
			</button>

			{isOpen && (
				<div
					className={cn(
						"absolute top-full left-0 mt-2 rounded-lg shadow-lg z-50 min-w-[140px] border border-divider bg-surface-2",
					)}
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
								>
									{option}
								</button>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
