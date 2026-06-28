import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { MessageSquare, Home } from 'lucide-react'
import { formatRent } from '@/lib/types'

export default async function InboxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: threads } = await supabase
    .from('chat_threads')
    .select(`id, listing_id, seeker_id, poster_id, updated_at,
      listings(id,title,rent,city),
      seeker_profile:profiles!chat_threads_seeker_id_fkey(id,full_name,avatar_path),
      poster_profile:profiles!chat_threads_poster_id_fkey(id,full_name,avatar_path)`)
    .or(`seeker_id.eq.${user.id},poster_id.eq.${user.id}`)
    .order('updated_at', { ascending: false })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <MessageSquare size={22}/>Inbox
      </h1>

      {!threads?.length ? (
        <div className="text-center py-16 card">
          <MessageSquare size={36} className="text-gray-300 mx-auto mb-3"/>
          <p className="text-gray-500 mb-4">No conversations yet.</p>
          <Link href="/listings" className="btn-primary">Browse rooms</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map((t: any) => {
            const other = t.seeker_id === user.id ? t.poster_profile : t.seeker_profile
            return (
              <Link key={t.id} href={`/inbox/${t.id}`}
                className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold shrink-0">
                  {other?.full_name?.[0] ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{other?.full_name ?? 'User'}</p>
                  <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                    <Home size={11}/>{t.listings?.title} · {t.listings?.rent ? formatRent(t.listings.rent) : ''}
                  </p>
                </div>
                <p className="text-xs text-gray-400 shrink-0">
                  {new Date(t.updated_at).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
