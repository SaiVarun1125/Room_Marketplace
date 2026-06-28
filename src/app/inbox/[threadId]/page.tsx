import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ChatView from '@/components/chat/ChatView'

export default async function ThreadPage({ params }: { params: { threadId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: thread } = await supabase
    .from('chat_threads')
    .select(`*, listings(id,title,rent,city),
      seeker_profile:profiles!chat_threads_seeker_id_fkey(id,full_name),
      poster_profile:profiles!chat_threads_poster_id_fkey(id,full_name)`)
    .eq('id', params.threadId)
    .or(`seeker_id.eq.${user.id},poster_id.eq.${user.id}`)
    .single()

  if (!thread) notFound()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('thread_id', params.threadId)
    .order('sent_at', { ascending: true })

  return <ChatView thread={thread as any} messages={messages ?? []} currentUserId={user.id}/>
}
