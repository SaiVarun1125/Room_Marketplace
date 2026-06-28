'use client'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Wifi, Sofa, Users, Heart } from 'lucide-react'
import type { ListingWithDetails } from '@/lib/types'
import { formatRent, LISTING_TYPE_LABELS } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import clsx from 'clsx'

interface Props {
  listing: ListingWithDetails
  currentUserId?: string
}

export default function ListingCard({ listing, currentUserId }: Props) {
  const supabase = createClient()
  const [saved, setSaved] = useState(listing.is_saved ?? false)
  const [savingInProgress, setSavingInProgress] = useState(false)

  const photo = listing.listing_photos?.[0]
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  async function toggleSave(e: React.MouseEvent) {
    e.preventDefault()
    if (!currentUserId || savingInProgress) return
    setSavingInProgress(true)
    if (saved) {
      await supabase.from('saved_listings')
        .delete().eq('user_id', currentUserId).eq('listing_id', listing.id)
    } else {
      await supabase.from('saved_listings')
        .insert({ user_id: currentUserId, listing_id: listing.id })
    }
    setSaved(!saved)
    setSavingInProgress(false)
  }

  return (
    <Link href={`/listings/${listing.id}`} className="card block hover:shadow-md transition-shadow group">
      {/* Photo */}
      <div className="relative h-48 bg-gray-100 rounded-t-xl overflow-hidden">
        {photo && supabaseUrl ? (
          <Image
            src={`${supabaseUrl}/storage/v1/object/public/listing-photos/${photo.storage_path}`}
            alt={listing.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Sofa size={40}/>
          </div>
        )}
        {/* Type badge */}
        <span className="absolute top-3 left-3 badge bg-white/90 text-gray-700 shadow-sm">
          {LISTING_TYPE_LABELS[listing.type]}
        </span>
        {/* Save button */}
        {currentUserId && (
          <button
            onClick={toggleSave}
            className={clsx(
              'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm',
              saved ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400 hover:text-red-500'
            )}
          >
            <Heart size={15} fill={saved ? 'currentColor' : 'none'}/>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 leading-snug line-clamp-1">{listing.title}</h3>
          <span className="text-brand-600 font-semibold whitespace-nowrap">{formatRent(listing.rent)}</span>
        </div>

        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <MapPin size={13}/>{listing.neighborhood ?? listing.city}, {listing.state}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {listing.furnished && <span className="badge bg-amber-50 text-amber-700"><Sofa size={11}/>Furnished</span>}
          {listing.utilities_included && <span className="badge bg-blue-50 text-blue-700"><Wifi size={11}/>Bills incl.</span>}
          {listing.private_room && <span className="badge bg-green-50 text-green-700"><Users size={11}/>Private</span>}
          {listing.gender_pref && <span className="badge bg-purple-50 text-purple-700">{listing.gender_pref}</span>}
        </div>

        {/* Poster */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
          <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-xs font-medium text-brand-700">
            {listing.profiles?.full_name?.[0] ?? '?'}
          </div>
          <span className="text-xs text-gray-500">
            {listing.profiles?.full_name ?? 'Anonymous'}
            {listing.profiles?.school ? ` · ${listing.profiles.school}` : ''}
          </span>
        </div>
      </div>
    </Link>
  )
}
