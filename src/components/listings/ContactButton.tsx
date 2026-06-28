'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { MessageSquare } from 'lucide-react'

interface Props { listingId: string; posterId: string; seekerId: string }

export default function ContactButton({ listingId, posterId, seekerId }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function startChat() {
    setLoading(true)
    // Get or create thread (unique constraint prevents duplicates)
    const { data: existing } = await supabase
      .from('chat_threads')
      .select('id')
      .eq('listing_id', listingId)
      .eq('seeker_id', seekerId)
      .single()

    if (existing) {
      router.push(`/inbox/${existing.id}`)
      return
    }

    const { data: thread } = await supabase
      .from('chat_threads')
      .insert({ listing_id: listingId, seeker_id: seekerId, poster_id: posterId })
      .select('id').single()

    if (thread) router.push(`/inbox/${thread.id}`)
    setLoading(false)
  }

  return (
    <button onClick={startChat} disabled={loading} className="btn-primary w-full">
      <MessageSquare size={16}/>{loading ? 'Opening chat…' : 'Message poster'}
    </button>
  )
}
