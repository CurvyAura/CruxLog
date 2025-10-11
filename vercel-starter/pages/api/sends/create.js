import { createSend } from '../../../lib/sends'
import { v4 as uuidv4 } from 'uuid'

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })
  const payload = req.body || {}
  const send = { id: uuidv4(), ...payload }

  try {
    await createSend(send)
    res.status(200).json({ message: 'Saved', send })
  } catch (err) {
    res.status(500).json({ message: 'Error', error: String(err) })
  }
}
