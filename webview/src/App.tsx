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
			setThoughts(savedThoughts);
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
		<div className="app">
			<header className="app-header">
				<h1>Activity Tracker — Daily Snapshot</h1>
				<p className="subtitle">A place for a short thought.</p>
			</header>

			<main className="grid">
				<section className="card quick-thought">
					<h2>Quick thought</h2>
					<form onSubmit={handleSubmit}>
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
						/>
						<div className="controls">
							<span className="count">{thought.length}/280</span>
							<div className="buttons">
								<button
									type="button"
									className="btn ghost"
									onClick={handleClear}
									disabled={saving}
								>
									Clear
								</button>
								<button
									type="submit"
									className="btn primary"
									disabled={!thought.trim() || saving}
								>
									{saving ? "Saving…" : "Save"}
								</button>
							</div>
						</div>

						{savedMessage && <div className="saved">{savedMessage}</div>}
						{error && (
							<div className="note" style={{ color: "var(--danger)" }}>
								{error}
							</div>
						)}
					</form>
				</section>
			</main>

			<section>
				<h2>Saved thoughts</h2>
				{thoughts.length === 0 ? (
					<p>No thoughts saved yet.</p>
				) : (
					<ul>
						{thoughts.map((t) => (
							<li key={t.timestamp}>
								<time dateTime={t.timestamp}>{t.timestamp}</time>: {t.text}
							</li>
						))}
					</ul>
				)}
			</section>

			<footer className="footer">
				This UI communicates with the extension via wrpc ("saveThought").
			</footer>
		</div>
	);
}

export default App;
