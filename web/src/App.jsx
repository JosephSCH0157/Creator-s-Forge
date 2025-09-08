import { useEffect, useState } from 'react'

export default function App() {
  const [ping, setPing] = useState('checking...')

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.text())
      .then(setPing)
      .catch(err => setPing(String(err)))
  }, [])

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Creator’s Forge</h1>
      <p>Backend says: {ping}</p>
    </div>
  )
}
