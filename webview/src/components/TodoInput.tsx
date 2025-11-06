import { useCallback, useEffect, useRef, useState } from "react";

type TodoInputProps = {
	initialValue?: string;
	placeholder?: string;
	onSubmit: (value: string) => void;
	onCancel: () => void;
};

export function TodoInput({
	initialValue = "",
	placeholder = "Task title...",
	onSubmit,
	onCancel,
}: TodoInputProps) {
	const [value, setValue] = useState(initialValue);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		const id = setTimeout(() => {
			if (textareaRef.current) {
				textareaRef.current.focus();
				// Move cursor to end of text
				const len = textareaRef.current.value.length;
				textareaRef.current.setSelectionRange(len, len);
			}
		}, 0);
		return () => clearTimeout(id);
	}, []);

	const adjustHeight = useCallback(() => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = "auto";
			textarea.style.height = `${textarea.scrollHeight}px`;
		}
	}, []);

	useEffect(() => {
		adjustHeight();
	}, [adjustHeight]);

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setValue(e.target.value);
		adjustHeight();
	};

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
				onChange={handleChange}
				onBlur={() => onSubmit(value)}
				onKeyDown={handleKeyDown}
			/>
		</div>
	);
}
