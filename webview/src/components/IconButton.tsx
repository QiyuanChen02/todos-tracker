interface IconButtonProps {
	iconName: string;
	onClick: () => void;
	title?: string;
	className?: string;
}

export function IconButton({
	iconName,
	onClick,
	title,
	className = "",
}: IconButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			title={title}
			className={`flex items-center justify-center p-1 rounded hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/40 ${className}`}
			style={{ height: "2rem", width: "2rem" }} // Ensures a square button and vertical centering
		>
			<i className={`codicon ${iconName}`} />
		</button>
	);
}
