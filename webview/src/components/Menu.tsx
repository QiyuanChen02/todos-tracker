import { type ReactNode, useEffect, useRef } from "react";
import { cn } from "../utils/cn";

type MenuProps = {
	isOpen: boolean;
	onClose: () => void;
	trigger: ReactNode;
	children: ReactNode;
	className?: string;
};

export function Menu({
	isOpen,
	onClose,
	trigger,
	children,
	className,
}: MenuProps) {
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onClose]);

	return (
		<div className="relative inline-block" ref={menuRef}>
			{trigger}
			{isOpen && (
				<div
					className={cn(
						"absolute top-full left-0 mt-2 rounded-lg shadow-lg z-50 border border-divider bg-surface-2",
						className,
					)}
				>
					{children}
				</div>
			)}
		</div>
	);
}
