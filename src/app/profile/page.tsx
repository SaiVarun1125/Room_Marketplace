import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, PlusCircle } from 'lucide-react'
import { formatRent, LISTING_TYPE_LABELS } from '@/lib/types'
import type { ListingType } from '@/lib/types'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/profile')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const { data: listings } = await supabase
    .from('listings')
    .select('*, listing_photos(*)')
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const statusColor: Record<string,string> = {
    active:'bg-green-50 text-green-700', pending_review:'bg-amber-50 text-amber-700',
    draft:'bg-gray-100 text-gray-600', matched:'bg-blue-50 text-blue-700',
    expired:'bg-red-50 text-red-600', removed:'bg-red-50 text-red-600',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Profile card */}
      <div className="card p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xl font-semibold">
            {profile?.full_name?.[0] ?? <User size={24}/>}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{profile?.full_name ?? 'Your profile'}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            {profile?.school && <p className="text-sm text-gray-500">{profile.school}</p>}
          </div>
        </div>
        <Link href="/profile/edit" className="btn-secondary">Edit profile</Link>
      </div>

      {/* My listings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">My listings</h2>
          <Link href="/listings/new" className="btn-primary"><PlusCircle size={16}/>New listing</Link>
        </div>

        {!listings?.length ? (
          <div className="card p-10 text-center">
            <p className="text-gray-500 mb-4">You haven't posted any listings yet.</p>
            <Link href="/listings/new" className="btn-primary">Post your first room</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((l: any) => (
              <div key={l.id} className="card p-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0 overflow-hidden flex items-center justify-center text-gray-300 text-xs">
                  {l.listing_photos?.[0] ? '📷' : 'No photo'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{l.title}</p>
                  <p className="text-sm text-gray-500">
                    {LISTING_TYPE_LABELS[l.type as ListingType]} · {formatRent(l.rent)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`badge ${statusColor[l.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {l.status.replace('_',' ')}
                  </span>
                  <Link href={`/listings/${l.id}/edit`} className="btn-secondary text-xs py-1.5 px-3">Edit</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
