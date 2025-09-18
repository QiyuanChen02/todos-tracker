import { useState } from 'react'
import './App.css'
import { useVSQuery } from './hooks/useVSQuery'

function App() {
  const [count, setCount] = useState(0)

  const { data, status } = useVSQuery<any>("sample");

  if (status === "loading") return <div>Loading...</div>;

  return (
    <>
      <div>
`        <h1>We have a message: {data!.info}</h1>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
