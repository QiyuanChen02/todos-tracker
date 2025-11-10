import type { MouseEventHandler } from "react";
import { cn } from "../utils/cn";

interface IconButtonProps {
	iconName: string;
	onClick?: MouseEventHandler<HTMLButtonElement>;
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
			className={cn(
				"flex items-center w-6 h-6 transition-colors justify-center cursor-pointer hover:text-text focus:outline-none",
				className,
			)}
		>
			<i className={cn("codicon", iconName)} />
		</button>
	);
}
