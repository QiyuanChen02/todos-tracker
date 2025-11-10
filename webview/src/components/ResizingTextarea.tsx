import { type ComponentPropsWithoutRef, useEffect, useRef } from "react";
import { cn } from "../utils/cn";

type ResizingTextareaProps = ComponentPropsWithoutRef<"textarea"> & {
	value: string;
	minHeight?: string;
};

export function ResizingTextarea({
	value,
	minHeight = "2.5rem",
	className,
	...props
}: ResizingTextareaProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: value is required as a dependency so the textarea resizes on value change
	useEffect(() => {
		const textarea = textareaRef.current;
		if (!textarea) return;
		textarea.style.height = "auto";
		textarea.style.height = `${textarea.scrollHeight}px`;
	}, [value]);

	return (
		<textarea
			ref={textareaRef}
			value={value}
			className={cn("w-full resize-none focus:outline-none", className)}
			rows={1}
			style={{ minHeight }}
			{...props}
		/>
	);
}
