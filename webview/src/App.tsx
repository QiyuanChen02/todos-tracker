import './App.css';
import { useRPCQuery } from './hooks/useRPC';

function App() {
  
  const response = useRPCQuery("showChanges", undefined, { enabled: false });

  return (
    <>
      <h1>Show Changes</h1>
      <button onClick={() => response.refetch()}>Refresh</button>
      <div style={{ marginTop: '20px' }}>
        {response.isLoading && <p>Loading...</p>}
        {response.error && <p style={{ color: 'red' }}>Error: {response.error.message}</p>}
        {response.data && response.data.diff ? (
          <div style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>
            <h2>Info:</h2>
            <pre>{response.data.info}</pre>
            <h2>Diff:</h2>
            <pre>{response.data.diff}</pre>
          </div>
        ) : (
          !response.isLoading && <p>No changes detected.</p>
        )}
      </div>
    </>
  )
}

export default App
