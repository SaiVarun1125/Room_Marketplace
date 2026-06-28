'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle } from 'lucide-react'

export default function AdminActions({ listingId }: { listingId: string }) {
  const supabase = createClient()
  const router = useRouter()

  async function approve() {
    await supabase.from('listings').update({ status: 'active' }).eq('id', listingId)
    router.refresh()
  }
  async function reject() {
    await supabase.from('listings').update({ status: 'removed' }).eq('id', listingId)
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <button onClick={approve} className="btn text-xs py-1.5 px-3 bg-green-50 text-green-700 hover:bg-green-100 flex items-center gap-1">
        <CheckCircle size={14}/>Approve
      </button>
      <button onClick={reject} className="btn text-xs py-1.5 px-3 bg-red-50 text-red-700 hover:bg-red-100 flex items-center gap-1">
        <XCircle size={14}/>Reject
      </button>
    </div>
  )
}
