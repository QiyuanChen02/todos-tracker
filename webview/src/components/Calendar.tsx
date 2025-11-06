import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

type CalendarProps = {
	selectedDate?: Date;
	onSelect: (date: Date | undefined) => void;
};

export function Calendar({ selectedDate, onSelect }: CalendarProps) {
	const handleSelect = (date: Date | undefined) => {
		if (date) {
			onSelect(date);
		}
	};

	return (
		<DayPicker
			mode="single"
			navLayout="around"
			selected={selectedDate}
			defaultMonth={selectedDate}
			onSelect={handleSelect}
			showOutsideDays
		/>
	);
}
