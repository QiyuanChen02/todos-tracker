import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { wrpc } from "./wrpc";

function App() {
	const [thought, setThought] = useState("");
	const [saving, setSaving] = useState(false);
	const [savedMessage, setSavedMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const [thoughts, setThoughts] = useState<
		{ text: string; timestamp: string }[]
	>([]);

	const fetchThoughts = useCallback(async () => {
		try {
			const savedThoughts = await wrpc("getThoughts", undefined);
			setThoughts(savedThoughts ?? []);
		} catch (err) {
			console.error("getThoughts failed:", err);
		}
	}, []);

	useEffect(() => {
		fetchThoughts();
	}, [fetchThoughts]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!thought.trim()) return;
		setSaving(true);
		setError(null);

		try {
			await wrpc("saveThought", { text: thought.trim() });
			setSavedMessage("Saved");
			setThought("");
		} catch (err) {
			console.error("saveThought failed:", err);
			setError("Save failed");
			setSavedMessage(null);
		} finally {
			setSaving(false);
			setTimeout(() => setSavedMessage(null), 1500);
			fetchThoughts();
		}
	}

	function handleClear() {
		setThought("");
		setSavedMessage(null);
		setError(null);
	}

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
									disabled={saving}
								>
									Clear
								</button>

								<button
									type="submit"
									className="px-4 py-1 rounded text-sm font-medium bg-primary-strong text-white hover:bg-primary disabled:opacity-50"
									disabled={!thought.trim() || saving}
								>
									{saving ? "Saving…" : "Save"}
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

					{thoughts.length === 0 ? (
						<p className="text-muted-text">No thoughts saved yet.</p>
					) : (
						<ul className="space-y-3">
							{thoughts.map((t) => (
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

			<footer className="mt-6 text-sm text-muted-text">
				This UI communicates with the extension via wrpc ("saveThought").
			</footer>
		</div>
	);
}

export default App;
