import { createClient } from '@/lib/supabase/server'
import ListingCard from '@/components/listings/ListingCard'
import ListingFilters from '@/components/listings/ListingFilters'
import Link from 'next/link'
import type { ListingWithDetails } from '@/lib/types'

interface SearchParams { q?:string; neighborhood?:string; max_rent?:string; type?:string; furnished?:string; utilities?:string }

export default async function ListingsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Build query
  let query = supabase
    .from('listings')
    .select(`*, listing_photos(*), listing_compliance(*)`)
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('last_refreshed_at', { ascending: false })
    .limit(48)

  if (sp.q)            query = query.ilike('title', `%${sp.q}%`)
  if (sp.neighborhood) query = query.eq('neighborhood', sp.neighborhood)
  if (sp.max_rent)     query = query.lte('rent', parseInt(sp.max_rent))
  if (sp.type)         query = query.eq('type', sp.type)
  if (sp.furnished === 'true') query = query.eq('furnished', true)
  if (sp.utilities === 'true') query = query.eq('utilities_included', true)

  const { data: listings } = await query

  // Fetch saved listings for the current user
  let savedIds = new Set<string>()
  if (user && listings?.length) {
    const { data: saved } = await supabase
      .from('saved_listings').select('listing_id').eq('user_id', user.id)
    savedIds = new Set(saved?.map(s => s.listing_id) ?? [])
  }

  const withSaved: ListingWithDetails[] = (listings ?? []).map(l => ({
    ...l,
    listing_photos: l.listing_photos ?? [],
    listing_compliance: l.listing_compliance?.[0] ?? null,
    is_saved: savedIds.has(l.id),
  })) as ListingWithDetails[]

  return (
    <div>
      <ListingFilters/>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-600">
            {withSaved.length} room{withSaved.length !== 1 ? 's' : ''} available
          </p>
          {user && (
            <Link href="/listings/new" className="btn-primary">+ List a room</Link>
          )}
        </div>

        {withSaved.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">No listings match your filters.</p>
            <Link href="/listings" className="btn-secondary">Clear filters</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {withSaved.map(listing => (
              <ListingCard key={listing.id} listing={listing} currentUserId={user?.id}/>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
