import fs from 'fs'
import path from 'path'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY

const DATA_FILE = path.join(process.cwd(), 'data', 'sends.json')

function ensureDataDir(){
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8')
}

async function readLocal(){
  ensureDataDir()
  const txt = await fs.promises.readFile(DATA_FILE, 'utf8')
  let parsed = null
  try { parsed = JSON.parse(txt || 'null') } catch { parsed = null }
  // Normalize legacy shapes:
  // - already an array -> return
  if (Array.isArray(parsed)) return parsed
  // - legacy shape from earlier store: { key: 'sends', value: { ... }, ts: ... }
  if (parsed && typeof parsed === 'object' && parsed.key === 'sends' && parsed.value) {
    const arr = Array.isArray(parsed.value) ? parsed.value : [parsed.value]
    // migrate file to array form
    await writeLocal(arr)
    return arr
  }
  // - file contains a single send object -> wrap in array and migrate
  if (parsed && typeof parsed === 'object' && parsed.id) {
    const arr = [parsed]
    await writeLocal(arr)
    return arr
  }
  // fallback: empty array
  return []
}

async function writeLocal(arr){
  ensureDataDir()
  await fs.promises.writeFile(DATA_FILE, JSON.stringify(arr, null, 2), 'utf8')
}

/* Supabase helpers: expects a 'sends' table with columns id, problem, grade, notes, sentAt */
async function sbFetch(pathSuffix, opts){
  const url = `${SUPABASE_URL}/rest/v1/${pathSuffix}`
  const headers = Object.assign({}, opts && opts.headers || {})
  headers['apikey'] = SUPABASE_KEY
  headers['Authorization'] = `Bearer ${SUPABASE_KEY}`
  headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  const res = await fetch(url, Object.assign({}, opts, { headers }))
  if (!res.ok) throw new Error(`Supabase error: ${res.status} ${res.statusText}`)
  const txt = await res.text()
  try { return JSON.parse(txt) } catch { return txt }
}

export async function listSends(){
  if (SUPABASE_URL && SUPABASE_KEY){
    // select all
    return sbFetch('sends?select=*', { method: 'GET' })
  }
  return readLocal()
}

export async function createSend(obj){
  if (SUPABASE_URL && SUPABASE_KEY){
    // insert
    return sbFetch('sends', { method: 'POST', body: JSON.stringify([obj]) })
  }
  const arr = await readLocal()
  arr.push(obj)
  await writeLocal(arr)
  return obj
}

export async function updateSend(id, changes){
  if (SUPABASE_URL && SUPABASE_KEY){
    // patch where id=eq.id
    const encoded = encodeURIComponent(`id=eq.${id}`)
    return sbFetch(`sends?${encoded}`, { method: 'PATCH', body: JSON.stringify(changes) })
  }
  const arr = await readLocal()
  const idx = arr.findIndex(s=>String(s.id)===String(id))
  if (idx === -1) throw new Error('Not found')
  arr[idx] = Object.assign({}, arr[idx], changes)
  await writeLocal(arr)
  return arr[idx]
}

export async function deleteSend(id){
  if (SUPABASE_URL && SUPABASE_KEY){
    const encoded = encodeURIComponent(`id=eq.${id}`)
    return sbFetch(`sends?${encoded}`, { method: 'DELETE' })
  }
  const arr = await readLocal()
  const out = arr.filter(s=>String(s.id)!==String(id))
  await writeLocal(out)
  return { deleted: true }
}
