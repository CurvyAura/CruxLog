import { deleteSend } from '../../../lib/sends'

export default async function handler(req, res){
  if (req.method !== 'DELETE') return res.status(405).json({ message: 'Method not allowed' })
  const { id } = req.query || {}
  if (!id) return res.status(400).json({ message: 'Missing id' })
  try {
    const result = await deleteSend(id)
    res.status(200).json({ message: 'Deleted', result })
  } catch (err) {
    res.status(500).json({ message: 'Error deleting', error: String(err) })
  }
}
