import { storeList } from '../../../lib/store'

export default async function handler(req, res){
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' })
  try {
    const items = await storeList()
    res.status(200).json(items)
  } catch (err) {
    res.status(500).json({ message: 'Error reading', error: String(err) })
  }
}
