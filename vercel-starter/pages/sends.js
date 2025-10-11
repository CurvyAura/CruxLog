import { useEffect, useState } from 'react'

function isoNow(){ return new Date().toISOString() }

export default function Sends(){
  const [sends, setSends] = useState([])
  const [problem, setProblem] = useState('')
  const [grade, setGrade] = useState('V0')
  const [notes, setNotes] = useState('')
  const gradesOrder = ['V0','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10']

  async function load(){
    try{
      const res = await fetch('/api/sends/list')
      const data = await res.json()
      setSends(data || [])
    }catch(e){
      console.error(e)
      setSends([])
    }
  }

  useEffect(()=>{ load() }, [])

  async function addSend(e){
    e.preventDefault()
    const payload = { problem, grade, notes, sentAt: isoNow() }
    await fetch('/api/sends/create', {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)
    })
    setProblem('')
    setNotes('')
    setGrade('V0')
    load()
  }

  async function removeSend(id){
    if (!confirm('Delete this send?')) return
    await fetch(`/api/sends/delete?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    load()
  }

  async function startEdit(item){
    setProblem(item.problem || '')
    setGrade(item.grade || 'V0')
    setNotes(item.notes || '')
    // put id into a hidden field on the form by using state
    setEditingId(item.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const [editingId, setEditingId] = useState(null)

  async function submitEdit(e){
    e.preventDefault()
    if (!editingId) return addSend(e)
    const changes = { problem, grade, notes }
    await fetch('/api/sends/update', { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: editingId, ...changes }) })
    setEditingId(null)
    setProblem('')
    setGrade('V0')
    setNotes('')
    load()
  }

  function exportCSV(){
    if (!sends || sends.length === 0) return alert('No sends to export')
    const rows = sends.map(s => [s.id, s.problem, s.grade, s.sentAt, (s.notes||'').replace(/\n/g,' ')])
    const csv = ['id,problem,grade,sentAt,notes', ...rows.map(r => r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sends.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="container">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <h1 style={{margin:0}}>Bouldering Sends</h1>
        <div className="muted">Track sends and progress</div>
      </div>

      <div className="grid">
        <div className="card">
          <form onSubmit={editingId ? submitEdit : addSend} className="form-row">
            <label>Problem
              <input value={problem} onChange={e=>setProblem(e.target.value)} required/>
            </label>
            <label>Grade
              <input value={grade} onChange={e=>setGrade(e.target.value)} required/>
            </label>
            <label>Notes
              <input value={notes} onChange={e=>setNotes(e.target.value)} />
            </label>
            <div style={{display:'flex',gap:8,marginTop:8,flexWrap:'wrap'}}>
              <button className="btn" type="submit">{editingId ? 'Save changes' : 'Add Send'}</button>
              <button type="button" className="btn secondary" onClick={load}>Refresh</button>
              {editingId && (<button type="button" className="btn secondary" onClick={()=>{ setEditingId(null); setProblem(''); setGrade('V0'); setNotes('') }}>Cancel</button>)}
              <button type="button" className="btn secondary" onClick={exportCSV}>Export CSV</button>
            </div>
          </form>
        </div>

        <div className="grid-2" style={{marginTop:12}}>
          <aside className="card">
            <h3 style={{marginTop:0}}>Summary</h3>
            <div>Total sends: <strong>{sends.length}</strong></div>
            <div style={{marginTop:8}}><strong>By grade</strong></div>
            <ul className="summary-list">
              {gradesOrder.map(g => (
                <li key={g}>{g}: {sends.filter(s=>s.grade===g).length}</li>
              ))}
            </ul>
            <div style={{marginTop:12}}>
              <h4 style={{margin:0}}>Grade distribution</h4>
              <GradeChart sends={sends} gradesOrder={gradesOrder} />
            </div>
          </aside>

          <div>
            <div className="card">
              <h2 style={{marginTop:0}}>Recent sends</h2>
              {sends.length === 0 ? <p className="muted">No sends yet.</p> : (
                <ul className="sends-list">
                  {sends.slice().reverse().map((s, i) => (
                    <li key={s.id || i}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <div><strong>{s.problem}</strong> <div className="sends-meta">{s.grade} • {new Date(s.sentAt).toLocaleString()}</div></div>
                      </div>
                      {s.notes && <div style={{marginTop:8,color:'var(--muted)'}}>{s.notes}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function GradeChart({ sends, gradesOrder }){
  const counts = gradesOrder.map(g => sends.filter(s => s.grade === g).length)
  const max = Math.max(1, ...counts)
  const width = 220
  const barW = Math.floor(width / gradesOrder.length)
  return (
    <svg width={width} height={80} style={{display:'block'}} aria-hidden>
      {counts.map((c,i) => {
        const h = Math.round((c / max) * 60)
        return (
          <g key={i} transform={`translate(${i*barW},0)`}> 
            <rect x={2} y={70-h} width={barW-4} height={h} fill="#60a5fa" />
            <text x={(barW-4)/2} y={78} fontSize={9} textAnchor="middle">{gradesOrder[i]}</text>
          </g>
        )
      })}
    </svg>
  )
}
