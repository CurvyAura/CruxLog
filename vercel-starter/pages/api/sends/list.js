import { listSends } from '../../../lib/sends'

export default async function handler(req, res){
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' })
  try {
    const items = await listSends()
    // ensure array
    return res.status(200).json(Array.isArray(items) ? items : [])
  } catch (err) {
    res.status(500).json({ message: 'Error reading', error: String(err) })
  }
}
