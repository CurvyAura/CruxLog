import Link from 'next/link'
import { useState } from 'react'

export default function Nav(){
  const [open, setOpen] = useState(false)
  return (
    <header className="container" style={{paddingTop:12}}>
      <div className="nav-wrap">
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div className="brand">BoulderLog</div>
          <div className="muted" style={{fontSize:13}}>track your sends</div>
        </div>

        <nav className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/sends">Sends</Link>
        </nav>

        <button className="mobile-toggle" onClick={()=>setOpen(v=>!v)} aria-expanded={open} aria-label="Toggle menu">
          {open ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          )}
        </button>
      </div>

      {open && (
        <div className="mobile-menu" style={{paddingTop:10}}>
          <Link href="/">Home</Link>
          <Link href="/sends">Sends</Link>
        </div>
      )}
    </header>
  )
}
