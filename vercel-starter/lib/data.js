import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')

function ensureDir(){
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR)
}

export async function writeData(key, obj){
  // only allow simple filename-safe keys
  ensureDir()
  const file = path.join(DATA_DIR, encodeURIComponent(key) + '.json')
  await fs.promises.writeFile(file, JSON.stringify(obj, null, 2), 'utf8')
}

export async function readAllData(){
  ensureDir()
  const files = await fs.promises.readdir(DATA_DIR)
  const out = []
  for (const f of files) {
    if (!f.endsWith('.json')) continue
    try {
      const txt = await fs.promises.readFile(path.join(DATA_DIR, f), 'utf8')
      out.push(JSON.parse(txt))
    } catch (e) {
      // ignore parse errors
    }
  }
  return out
}
