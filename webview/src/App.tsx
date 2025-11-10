import { useState } from "react";
import { CalendarView } from "./tabs/CalendarView";
import { KanbanView } from "./tabs/KanbanView";
import { cn } from "./utils/cn";
import { wrpc } from "./wrpc";

type TabId = "kanban" | "calendar";

interface TabButtonProps {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"px-4 py-2 font-medium transition-colors",
				active
					? "text-text border-b-2 border-accent"
					: "text-muted-text hover:text-text",
			)}
		>
			{children}
		</button>
	);
}

export default function App() {
	const { data } = wrpc.useQuery("fetchTodos");
	const [activeTab, setActiveTab] = useState<TabId>("kanban");

	return (
		<div className="h-screen bg-background p-8">
			<div className="h-full max-w-7xl mx-auto flex flex-col">
				<header className="mb-6">
					<h1 className="text-2xl font-bold text-text mb-2">
						Workspace TODO Manager
					</h1>
					<p className="text-muted-text">
						Organize, track, and complete your coding tasks with ease
					</p>
				</header>

				{/* Tabs */}
				<div className="flex gap-2 mb-6 border-b border-border">
					<TabButton
						active={activeTab === "kanban"}
						onClick={() => setActiveTab("kanban")}
					>
						Kanban
					</TabButton>
					<TabButton
						active={activeTab === "calendar"}
						onClick={() => setActiveTab("calendar")}
					>
						Calendar
					</TabButton>
				</div>

				{/* Tab Content */}
				{activeTab === "kanban" ? (
					<div className="h-[calc(100vh-200px)]">
						<KanbanView data={data} />
					</div>
				) : (
					<div className="h-[calc(100vh-200px)]">
						<CalendarView data={data} />
					</div>
				)}
			</div>
		</div>
	);
}
