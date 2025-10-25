import type { ReactNode } from "react";

interface BoardColumnProps {
	id: string;
	title: string;
	count: number;
	children: ReactNode;
	statusColor?: "todo" | "in-progress" | "done";
}

export function BoardColumn({
	title,
	count,
	children,
	statusColor = "todo",
}: BoardColumnProps) {
	const colorClasses = {
		todo: "border-l-4 border-l-warning",
		"in-progress": "border-l-4 border-l-primary",
		done: "border-l-4 border-l-success",
	};

	return (
		<div className="flex flex-col h-full">
			<div
				className={`rounded-t-lg border border-divider bg-column-header p-4 ${colorClasses[statusColor]}`}
			>
				<div className="flex items-center justify-between">
					<h2 className="text-base font-semibold text-text">{title}</h2>
					<span className="px-2.5 py-0.5 rounded-full bg-surface text-xs font-medium text-muted-text">
						{count}
					</span>
				</div>
			</div>

			<div
				className={`flex-1 rounded-b-lg border-l border-r border-b border-divider bg-column-bg p-4 space-y-3 overflow-y-auto min-h-[400px] transition-colors`}
			>
				{children}
			</div>
		</div>
	);
}
