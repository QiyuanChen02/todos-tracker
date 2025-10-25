interface TodoCardProps {
	id: string;
	preview: string;
	filePath: string;
	line: number;
}

export function TodoCard({ preview, filePath, line }: TodoCardProps) {
	return (
		<div className="p-4 rounded-lg border border-divider bg-card shadow-sm hover:shadow-md hover:border-primary cursor-grab active:cursor-grabbing group">
			<div className="space-y-3">
				<div className="flex items-start justify-between gap-2">
					<code className="text-sm font-mono text-text flex-1 break-words">
						{preview}
					</code>
				</div>

				<div className="flex items-center justify-between pt-2 border-t border-divider">
					<div className="flex items-center gap-2 text-xs text-muted-text">
						<svg
							className="w-3.5 h-3.5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						<span className="truncate max-w-[120px]" title={filePath}>
							{filePath}
						</span>
					</div>

					<div className="flex items-center gap-1 text-xs text-muted-text">
						<svg
							className="w-3.5 h-3.5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
							/>
						</svg>
						<span>Line {line}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
