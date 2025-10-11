import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Store(){
  const router = useRouter()
  useEffect(()=>{ router.replace('/sends') }, [])
  return null
}
