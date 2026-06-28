import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Calendar, Wifi, Sofa, Users, FileCheck, AlertTriangle, MessageSquare, RefreshCw } from 'lucide-react'
import { formatRent, formatDeposit, LISTING_TYPE_LABELS } from '@/lib/types'
import ContactButton from '@/components/listings/ContactButton'

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: listing } = await supabase
    .from('listings')
    .select(`*, listing_photos(*), profiles(id,full_name,avatar_path,school,bio), listing_compliance(*)`)
    .eq('id', params.id)
    .eq('status', 'active')
    .is('deleted_at', null)
    .single()

  if (!listing) notFound()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const photos = listing.listing_photos ?? []
  const compliance = listing.listing_compliance?.[0]
  const isOwner = user?.id === listing.owner_id

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Photos */}
          <div className="rounded-xl overflow-hidden bg-gray-100 h-72 relative">
            {photos[0] && supabaseUrl ? (
              <Image
                src={`${supabaseUrl}/storage/v1/object/public/listing-photos/${photos[0].storage_path}`}
                alt={listing.title} fill className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Sofa size={60}/>
              </div>
            )}
            <span className="absolute top-3 left-3 badge bg-white/90 text-gray-700 shadow-sm">
              {LISTING_TYPE_LABELS[listing.type as keyof typeof LISTING_TYPE_LABELS]}
            </span>
          </div>

          {/* Title & location */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">{listing.title}</h1>
            <div className="flex items-center gap-1 text-gray-500">
              <MapPin size={15}/>{listing.neighborhood ?? listing.city}, {listing.state}
              {listing.zipcode && ` ${listing.zipcode}`}
            </div>
          </div>

          {/* Details grid */}
          <div className="card p-5 grid grid-cols-2 gap-4">
            {[
              { label: 'Monthly rent',   value: formatRent(listing.rent) },
              { label: 'Deposit',        value: formatDeposit(listing.deposit) },
              { label: 'Available from', value: new Date(listing.available_from).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) },
              { label: 'Available to',   value: listing.available_to ? new Date(listing.available_to).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'Flexible' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                <p className="font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {listing.furnished && <span className="badge bg-amber-50 text-amber-700 px-3 py-1"><Sofa size={13}/>Furnished</span>}
            {listing.utilities_included && <span className="badge bg-blue-50 text-blue-700 px-3 py-1"><Wifi size={13}/>Utilities included</span>}
            {listing.private_room && <span className="badge bg-green-50 text-green-700 px-3 py-1"><Users size={13}/>Private room</span>}
            {listing.gender_pref && <span className="badge bg-purple-50 text-purple-700 px-3 py-1">{listing.gender_pref} preferred</span>}
          </div>

          {/* Description */}
          {listing.description && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-3">About this room</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>
          )}

          {/* Compliance */}
          {compliance && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><FileCheck size={16}/>Lease details</h2>
              <ul className="space-y-2 text-sm">
                {[
                  { label: 'Landlord consent required', value: compliance.landlord_consent_required },
                  { label: 'Landlord consent available', value: compliance.landlord_consent_available },
                  { label: 'Lease document available', value: compliance.lease_doc_available },
                  { label: 'Prime tenant confirmed', value: compliance.prime_tenant_confirmed },
                ].map(({ label, value }) => (
                  <li key={label} className="flex items-center justify-between">
                    <span className="text-gray-600">{label}</span>
                    <span className={value ? 'text-green-600 font-medium' : 'text-gray-400'}>
                      {value ? '✓ Yes' : '—'}
                    </span>
                  </li>
                ))}
                {compliance.transfer_fee && (
                  <li className="flex items-center justify-between">
                    <span className="text-gray-600">Transfer fee</span>
                    <span className="font-medium">{formatDeposit(compliance.transfer_fee)}</span>
                  </li>
                )}
              </ul>
              <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
                <AlertTriangle size={12}/>Always verify lease terms before signing anything.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Poster card */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Posted by</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold">
                {listing.profiles?.full_name?.[0] ?? '?'}
              </div>
              <div>
                <p className="font-medium text-gray-900">{listing.profiles?.full_name ?? 'Anonymous'}</p>
                {listing.profiles?.school && <p className="text-xs text-gray-500">{listing.profiles.school}</p>}
              </div>
            </div>
            {listing.profiles?.bio && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{listing.profiles.bio}</p>
            )}

            {isOwner ? (
              <Link href={`/listings/${listing.id}/edit`} className="btn-secondary w-full">Edit listing</Link>
            ) : user ? (
              <ContactButton listingId={listing.id} posterId={listing.owner_id} seekerId={user.id}/>
            ) : (
              <Link href={`/auth/login?next=/listings/${listing.id}`} className="btn-primary w-full">
                <MessageSquare size={16}/>Sign in to contact
              </Link>
            )}
          </div>

          {/* Last refreshed */}
          <div className="text-xs text-gray-400 flex items-center gap-1 px-1">
            <RefreshCw size={11}/>
            Updated {new Date(listing.last_refreshed_at).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
          </div>

          {/* Report */}
          {user && !isOwner && (
            <button className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 px-1">
              <AlertTriangle size={11}/>Report this listing
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
