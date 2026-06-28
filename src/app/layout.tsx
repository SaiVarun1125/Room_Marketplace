import type { Metadata } from 'next'
import '@/styles/globals.css'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/ui/Navbar'

export const metadata: Metadata = {
  title: 'RoomMate SGF — Find rooms in Springfield, MO',
  description: 'Verified room listings and roommate matching for students in Springfield, Missouri.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles').select('full_name,avatar_path,role').eq('id', user.id).single()
    profile = data
  }
  return (
    <html lang="en">
      <body>
        <Navbar user={user} profile={profile} />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  )
}
