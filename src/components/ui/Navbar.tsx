'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, PlusCircle, MessageSquare, Bookmark, User, LogOut, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupaUser } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'
import clsx from 'clsx'

interface Props {
  user: SupaUser | null
  profile: Pick<Profile,'full_name'|'avatar_path'|'role'> | null
}

export default function Navbar({ user, profile }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/'); router.refresh()
  }

  const link = (href: string, label: string, Icon: React.ElementType) => (
    <Link href={href} className={clsx(
      'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
      pathname.startsWith(href) ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100'
    )}>
      <Icon size={16} />{label}
    </Link>
  )

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900">
          <Home size={20} className="text-brand-600" />
          RoomMate <span className="text-brand-600">SGF</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {link('/listings', 'Browse', Home)}
          {user && link('/inbox', 'Inbox', MessageSquare)}
          {user && link('/saved', 'Saved', Bookmark)}
          {profile?.role === 'admin' && link('/admin', 'Admin', Shield)}
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/listings/new" className="btn-primary hidden sm:flex"><PlusCircle size={16}/>List a room</Link>
              <Link href="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                <User size={16}/><span className="hidden md:inline">{profile?.full_name?.split(' ')[0] ?? 'Profile'}</span>
              </Link>
              <button onClick={signOut} className="btn-ghost p-2" title="Sign out"><LogOut size={16}/></button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn-secondary">Sign in</Link>
              <Link href="/listings/new" className="btn-primary hidden sm:flex"><PlusCircle size={16}/>List a room</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
