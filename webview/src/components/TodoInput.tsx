import { useEffect, useRef, useState } from "react";

type TodoInputProps = {
	initialValue?: string;
	placeholder?: string;
	submitting?: boolean;
	onSubmit: (value: string) => void;
	onCancel: () => void;
};

export function TodoInput({
	initialValue = "",
	placeholder = "Task title...",
	submitting = false,
	onSubmit,
	onCancel,
}: TodoInputProps) {
	const [value, setValue] = useState(initialValue);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		const id = setTimeout(() => textareaRef.current?.focus(), 0);
		return () => clearTimeout(id);
	}, []);

	const doSubmit = () => {
		onSubmit(value);
	};

	const doCancel = () => {
		setValue(initialValue);
		onCancel();
	};

	const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
		e,
	) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			doSubmit();
		}
		if (e.key === "Escape") doCancel();
	};

	return (
		<div className="p-4 rounded-lg border border-divider bg-card shadow-sm hover:shadow-md hover:border-primary focus-within:border-primary">
			<textarea
				ref={textareaRef}
				className="w-full bg-transparent outline-none text-sm text-text resize-none"
				placeholder={placeholder}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onBlur={() => onSubmit(value)}
				onKeyDown={handleKeyDown}
				disabled={submitting}
				rows={1}
			/>
		</div>
	);
}
