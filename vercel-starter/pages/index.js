import Link from 'next/link'

export default function Home() {
  return (
    <main className="container">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div>
          <h1 style={{margin:0}}>BoulderLog</h1>
          <div className="muted">A lightweight sends tracker</div>
        </div>
        <div>
          <Link href="/sends" className="btn">Open Sends</Link>
        </div>
      </div>

      <div className="card">
        <p>Focus is on tracking bouldering sends. Use the Sends page to add, edit, delete, and export your sends.</p>
      </div>
    </main>
  )
}
