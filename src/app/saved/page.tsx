import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ListingCard from '@/components/listings/ListingCard'
import Link from 'next/link'
import { Bookmark } from 'lucide-react'
import type { ListingWithDetails } from '@/lib/types'

export default async function SavedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/saved')

  const { data: saved } = await supabase
    .from('saved_listings')
    .select(`listing_id, listings(*, listing_photos(*), profiles(id,full_name,avatar_path,school), listing_compliance(*))`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const listings: ListingWithDetails[] = (saved ?? [])
    .map((s: any) => ({
      ...s.listings,
      listing_photos: s.listings?.listing_photos ?? [],
      listing_compliance: s.listings?.listing_compliance?.[0] ?? null,
      is_saved: true,
    }))
    .filter(Boolean) as ListingWithDetails[]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Bookmark size={22}/>Saved rooms
      </h1>
      {listings.length === 0 ? (
        <div className="card p-16 text-center">
          <Bookmark size={36} className="text-gray-300 mx-auto mb-3"/>
          <p className="text-gray-500 mb-4">No saved rooms yet.</p>
          <Link href="/listings" className="btn-primary">Browse rooms</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(l => <ListingCard key={l.id} listing={l} currentUserId={user.id}/>)}
        </div>
      )}
    </div>
  )
}
