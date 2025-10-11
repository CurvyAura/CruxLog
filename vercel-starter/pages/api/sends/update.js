import { updateSend } from '../../../lib/sends'

export default async function handler(req, res){
  if (req.method !== 'PATCH') return res.status(405).json({ message: 'Method not allowed' })
  const { id, ...changes } = req.body || {}
  if (!id) return res.status(400).json({ message: 'Missing id' })
  try {
    const updated = await updateSend(id, changes)
    res.status(200).json({ message: 'Updated', updated })
  } catch (err) {
    res.status(500).json({ message: 'Error updating', error: String(err) })
  }
}
