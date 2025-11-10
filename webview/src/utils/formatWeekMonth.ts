import type { Dayjs } from "dayjs";

/**
 * Formats the month display for a week range.
 * If the week spans two months, shows "Oct - Nov 2025".
 * Otherwise shows "October 2025".
 */
export function formatWeekMonth(weekStart: Dayjs): string {
	const weekEnd = weekStart.add(6, "day");
	const startMonth = weekStart.month();
	const endMonth = weekEnd.month();
	const year = weekEnd.year();

	if (startMonth !== endMonth) {
		// Week spans two months
		return `${weekStart.format("MMM")} - ${weekEnd.format("MMM")} ${year}`;
	}

	// Single month
	return weekStart.format("MMMM YYYY");
}
