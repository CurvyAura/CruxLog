import { writeData, readAllData } from './data'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY

async function supabaseInsert(key, value){
  const url = `${SUPABASE_URL}/rest/v1/kv`
  const body = [{ key, value, created_at: new Date().toISOString() }]
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    },
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error(`Supabase insert failed: ${res.status}`)
  return true
}

async function supabaseList(){
  const url = `${SUPABASE_URL}/rest/v1/kv?select=key,value,created_at`
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  })
  if (!res.ok) throw new Error(`Supabase list failed: ${res.status}`)
  return res.json()
}

export async function storeInsert(key, value){
  if (SUPABASE_URL && SUPABASE_KEY) {
    return supabaseInsert(key, value)
  }
  return writeData(key, { key, value, ts: Date.now() })
}

export async function storeList(){
  if (SUPABASE_URL && SUPABASE_KEY) {
    return supabaseList()
  }
  return readAllData()
}
