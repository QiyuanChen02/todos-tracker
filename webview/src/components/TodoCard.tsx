import type { SchemaTypes } from "../../../src/database/schema";

const priorityColors = {
	low: "text-blue-500 bg-blue-500/10 border-blue-500/20",
	medium: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
	high: "text-red-500 bg-red-500/10 border-red-500/20",
};

const priorityLabels = {
	low: "Low",
	medium: "Medium",
	high: "High",
};

export function TodoCard({ title, priority, comments }: SchemaTypes["todos"]) {
	return (
		<div className="p-4 rounded-lg border border-divider bg-card shadow-sm hover:shadow-md hover:border-primary cursor-grab active:cursor-grabbing group">
			<div className="space-y-3">
				<div className="flex items-start justify-between gap-2">
					<h3 className="text-sm font-semibold text-text flex-1 break-words">
						{title}
					</h3>
					<span
						className={`px-2 py-0.5 rounded text-xs font-medium border ${priorityColors[priority]}`}
					>
						{priorityLabels[priority]}
					</span>
				</div>

				{comments && (
					<p className="text-xs text-muted-text line-clamp-2">{comments}</p>
				)}
			</div>
		</div>
	);
}
