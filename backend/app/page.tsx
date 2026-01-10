export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Delta API</h1>
      <p>Traffic signal detection backend for accessibility.</p>
      <h2>Endpoints</h2>
      <ul>
        <li><code>GET /api/health</code> - Health check</li>
        <li><code>POST /api/detect</code> - Detect traffic signal state from image</li>
      </ul>
    </main>
  );
}
