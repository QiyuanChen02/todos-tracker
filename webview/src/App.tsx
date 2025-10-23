import type React from "react";
import { useState } from "react";
import { wrpc } from "./wrpc";

export default function App() {
	const [thought, setThought] = useState("");
	const [savedMessage, setSavedMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const { data: thoughts, isLoading } = wrpc.useQuery("getThoughts", undefined);

	const qc = wrpc.useUtils();
	const saveMutation = wrpc.useMutation("saveThought", {
		onSuccess: () => {
			setSavedMessage("Saved");
			setThought("");
			void qc.invalidate("getThoughts");
			setTimeout(() => setSavedMessage(null), 1500);
		},
		onError: (err) => {
			console.error("saveThought failed:", err);
			setError("Save failed");
			setSavedMessage(null);
		},
	});

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!thought.trim()) return;
		setError(null);
		await saveMutation.mutateAsync({ text: thought.trim() });
	}

	function handleClear() {
		setThought("");
		setSavedMessage(null);
		setError(null);
	}

	if (isLoading || !thoughts) return;

	return (
		<div className="min-h-screen p-6 bg-surface text-text">
			<header className="mb-6">
				<h1 className="text-2xl md:text-3xl font-semibold">
					Activity Tracker — Daily Snapshot
				</h1>
				<p className="text-sm mt-1 text-muted-text">
					A place for a short thought.
				</p>
			</header>

			<main className="grid gap-6 md:grid-cols-2">
				<section className="rounded-lg shadow-sm p-6 border border-divider bg-surface-2 text-text">
					<h2 className="text-lg font-medium mb-3">Quick thought</h2>
					<form onSubmit={handleSubmit} className="flex flex-col gap-3">
						<label htmlFor="thought" className="sr-only">
							Type a quick thought
						</label>
						{/** biome-ignore lint/correctness/useUniqueElementIds: false positive */}
						<textarea
							id="thought"
							value={thought}
							onChange={(e) => setThought(e.target.value)}
							placeholder="Had an insight? Jot a quick thought..."
							rows={4}
							maxLength={280}
							className="w-full p-3 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary border border-divider bg-transparent text-text placeholder-muted-text"
						/>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-text">
								{thought.length}/280
							</span>

							<div className="flex items-center gap-2">
								<button
									type="button"
									className="px-3 py-1 rounded text-sm border border-divider text-text bg-transparent disabled:opacity-50"
									onClick={handleClear}
								>
									Clear
								</button>

								<button
									type="submit"
									className="px-4 py-1 rounded text-sm font-medium bg-primary-strong text-white hover:bg-primary disabled:opacity-50"
									disabled={!thought.trim() || saveMutation.isPending}
								>
									{saveMutation.isPending ? "Saving…" : "Save"}
								</button>
							</div>
						</div>

						{savedMessage && (
							<div className="text-sm mt-2 text-success">{savedMessage}</div>
						)}
						{error && <div className="text-sm mt-2 text-danger">{error}</div>}
					</form>
				</section>

				<section className="rounded-lg shadow-sm p-6 border border-divider bg-surface-2 text-text">
					<h2 className="text-lg font-medium mb-3">Saved thoughts</h2>

					{isLoading ? (
						<p className="text-muted-text">Loading...</p>
					) : thoughts.length === 0 ? (
						<p className="text-muted-text">No thoughts saved yet.</p>
					) : (
						<ul className="space-y-3">
							{(thoughts as { text: string; timestamp: string }[]).map((t) => (
								<li
									key={t.timestamp}
									className="p-3 rounded-md border border-divider bg-transparent text-text"
								>
									<time
										dateTime={t.timestamp}
										className="text-xs block text-muted-text"
									>
										{new Date(t.timestamp).toLocaleString()}
									</time>
									<div className="mt-1">{t.text}</div>
								</li>
							))}
						</ul>
					)}
				</section>
			</main>
		</div>
	);
}
