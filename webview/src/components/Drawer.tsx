import { type ReactNode, useEffect } from "react";
import { cn } from "../utils/cn";
import { IconButton } from "./IconButton";

export type DrawerProps = {
	open: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
};

export function Drawer({ open, onClose, title, children }: DrawerProps) {
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, onClose]);

	return (
		<>
			{/* Backdrop: sits above app content, but below the drawer */}
			<button
				type="button"
				aria-label="Close drawer"
				className={cn(
					"fixed inset-0 z-40 transition-opacity duration-500",
					open ? "opacity-100" : "opacity-0 pointer-events-none",
				)}
				onClick={onClose}
			/>
			{/* Drawer panel: high z-index, interactive */}
			<aside
				className={cn(
					"fixed right-0 top-0 z-50 h-full w-xl max-w-[85vw] bg-card border-l border-divider shadow-2xl transition-transform duration-500",
					open ? "translate-x-0" : "translate-x-full",
				)}
			>
				<header className="flex items-center justify-between px-6 py-4 border-b border-divider">
					<h2 className="text-base font-semibold text-text">{title}</h2>
					<IconButton
						iconName="codicon-close"
						title="Close"
						onClick={(e) => {
							e.stopPropagation();
							onClose();
						}}
						className="cursor-pointer"
					/>
				</header>

				<div className="p-6 space-y-6 overflow-y-auto h-[calc(100%-4rem)]">
					{children}
				</div>
			</aside>
		</>
	);
}
