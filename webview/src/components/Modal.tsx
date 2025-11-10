import { type ReactNode, useEffect } from "react";
import { cn } from "../utils/cn";
import { IconButton } from "./IconButton";

export type ModalProps = {
	open: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
};

export function Modal({ open, onClose, title, children }: ModalProps) {
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, onClose]);

	if (!open) return null;

	return (
		<>
			{/* Overlay */}
			<div
				className="fixed inset-0 z-40 bg-transparent"
				aria-hidden="true"
				onClick={onClose}
			/>
			{/* Modal */}
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
				<div
					className={cn(
						"relative w-full max-w-2xl max-h-[90vh] bg-card border border-divider rounded-lg shadow-2xl pointer-events-auto overflow-hidden",
					)}
					role="dialog"
					aria-modal="true"
				>
					<header className="flex items-center justify-between px-6 py-4 border-b border-divider">
						<h2 className="text-base font-semibold text-text">{title}</h2>
						<IconButton
							iconName="codicon-close"
							title="Close"
							onClick={onClose}
						/>
					</header>

					<div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-5rem)]">
						{children}
					</div>
				</div>
			</div>
		</>
	);
}
