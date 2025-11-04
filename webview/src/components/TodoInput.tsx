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
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const id = setTimeout(() => inputRef.current?.focus(), 0);
		return () => clearTimeout(id);
	}, []);

	const doSubmit = () => {
		const v = value.trim();
		onSubmit(v);
	};

	const doCancel = () => {
		setValue(initialValue);
		onCancel();
	};

	const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
		if (e.key === "Enter") doSubmit();
		if (e.key === "Escape") doCancel();
	};

	const handleBlur: React.FocusEventHandler<HTMLInputElement> = () => {
		doSubmit();
	};

	return (
		<div className="p-4 rounded-lg border border-divider bg-card shadow-sm hover:shadow-md hover:border-primary focus-within:border-primary">
			<input
				ref={inputRef}
				type="text"
				className="w-full bg-transparent outline-none text-sm text-text"
				placeholder={placeholder}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onBlur={handleBlur}
				onKeyDown={handleKeyDown}
				disabled={submitting}
			/>
		</div>
	);
}
