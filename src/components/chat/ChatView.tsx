'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Send } from 'lucide-react'
import { formatRent } from '@/lib/types'
import type { Message } from '@/lib/types'
import clsx from 'clsx'

interface Props {
  thread: any
  messages: Message[]
  currentUserId: string
}

export default function ChatView({ thread, messages: initial, currentUserId }: Props) {
  const [messages, setMessages] = useState<Message[]>(initial)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Scroll to bottom
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`thread:${thread.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `thread_id=eq.${thread.id}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [thread.id, supabase])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim() || sending) return
    setSending(true)
    await supabase.from('messages').insert({
      thread_id: thread.id, sender_id: currentUserId, body: body.trim(),
    })
    setBody(''); setSending(false)
  }

  const other = thread.seeker_id === currentUserId ? thread.poster_profile : thread.seeker_profile

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
        <Link href="/inbox" className="btn-ghost p-2"><ArrowLeft size={18}/></Link>
        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold">
          {other?.full_name?.[0] ?? '?'}
        </div>
        <div>
          <p className="font-medium text-gray-900">{other?.full_name}</p>
          <Link href={`/listings/${thread.listing_id}`} className="text-xs text-brand-600 hover:underline">
            {thread.listings?.title} · {thread.listings?.rent ? formatRent(thread.listings.rent) : ''}
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">No messages yet. Say hi!</p>
        )}
        {messages.map(m => {
          const isMe = m.sender_id === currentUserId
          return (
            <div key={m.id} className={clsx('flex', isMe ? 'justify-end' : 'justify-start')}>
              <div className={clsx(
                'max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                isMe ? 'bg-brand-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'
              )}>
                {m.body}
                <p className={clsx('text-xs mt-1', isMe ? 'text-brand-200' : 'text-gray-400')}>
                  {new Date(m.sent_at).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <form onSubmit={send} className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
        <input
          value={body} onChange={e => setBody(e.target.value)}
          placeholder="Type a message…" className="input flex-1"
        />
        <button type="submit" disabled={sending || !body.trim()} className="btn-primary px-4">
          <Send size={16}/>
        </button>
      </form>
    </div>
  )
}
