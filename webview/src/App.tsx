import { useEffect, useState } from 'react';
import './App.css';
import { useVSQuery } from './hooks/useVSQuery';
// @ts-ignore: VSCode API is injected at runtime
import { vscodeAPI } from './hooks/useVSQuery';

function App() {
  const { data, status, refresh } = useVSQuery<{ info: string, diff: string }>("showChanges");

  // Keep an array of file change snapshots. Each entry is { info, diff, timestamp }
  const [fileChanges, setFileChanges] = useState<Array<{ info: string; diff: string; ts: string }>>(() => {
    // Restore state from VSCode API if available
    const savedState = vscodeAPI.getState();
    return savedState?.fileChanges || [];
  });

  useEffect(() => {
    if (!data) return;
    console.log('Data updated:', data);
    // Append to fileChanges only when diff is non-empty (a change was detected)
    if (data.diff) {
      console.log('New change detected, updating history.');
      setFileChanges(prev => {
        const updated = [{ info: data.info, diff: data.diff, ts: new Date().toISOString() }, ...prev];
        vscodeAPI.setState({ fileChanges: updated }); // Persist state
        return updated;
      });
    }
  }, [data]);

  if (status === "loading" || !data) return <div>Loading...</div>;

  return (
    <>
      <h1>Show File Changes</h1>
      <div className="card">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => refresh()}>
            {fileChanges.length > 0 ? 'Refresh Changes' : 'Show File Changes'}
          </button>
          <button onClick={() => {
            setFileChanges([]);
            vscodeAPI.setState({ fileChanges: [] }); // Clear persisted state
          }} disabled={fileChanges.length === 0}>
            Clear History
          </button>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: '#666' }}>{fileChanges.length} changes recorded</div>
        </div>

        {fileChanges.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {fileChanges.map((entry, idx) => (
              <div key={entry.ts + idx} style={{ borderTop: '1px solid #eee', paddingTop: 8, marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{entry.info}</strong>
                  <span style={{ fontSize: 12, color: '#888' }}>{new Date(entry.ts).toLocaleString()}</span>
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', background: '#fafafa', padding: 8 }}>{entry.diff}</pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default App;
