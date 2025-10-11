import { storeInsert } from '../../../lib/store'

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })
  const { key, value } = req.body || {}
  if (!key) return res.status(400).json({ message: 'Missing key' })

  try {
    await storeInsert(key, value)
    res.status(200).json({ message: 'Saved' })
  } catch (err) {
    res.status(500).json({ message: 'Error saving', error: String(err) })
  }
}
