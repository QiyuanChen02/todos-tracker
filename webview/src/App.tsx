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
				"px-4 py-2 font-medium transition-colors cursor-pointer",
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
	const { data: workspaceState } = wrpc.useQuery(
		"workspaceState.getWorkspaceState",
	);

	const qc = wrpc.useUtils();
	const updateTab = wrpc.useMutation("workspaceState.updateCurrentTab", {
		onSuccess: () => qc.invalidate("workspaceState.getWorkspaceState"),
	});

	const activeTab: TabId = workspaceState?.currentTab ?? "kanban";

	// Persist tab changes
	const handleTabChange = (tab: TabId) => {
		updateTab.mutate({ tab });
	};

	if (!workspaceState) return null;

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
						onClick={() => handleTabChange("kanban")}
					>
						Kanban
					</TabButton>
					<TabButton
						active={activeTab === "calendar"}
						onClick={() => handleTabChange("calendar")}
					>
						Calendar
					</TabButton>
				</div>

				{/* Tab Content */}
				{activeTab === "kanban" ? (
					<div className="h-[calc(100vh-200px)]">
						<KanbanView />
					</div>
				) : (
					<div className="h-[calc(100vh-200px)]">
						<CalendarView />
					</div>
				)}
			</div>
		</div>
	);
}
