'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal } from 'lucide-react'
import { SPRINGFIELD_NEIGHBORHOODS } from '@/lib/types'
import { useCallback } from 'react'

export default function ListingFilters() {
  const router = useRouter()
  const params = useSearchParams()

  const update = useCallback((key: string, value: string) => {
    const p = new URLSearchParams(params.toString())
    if (value) p.set(key, value); else p.delete(key)
    p.delete('page')
    router.push(`/listings?${p.toString()}`)
  }, [params, router])

  return (
    <div className="bg-white border-b border-gray-100 sticky top-14 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            className="input pl-9" placeholder="Search listings…"
            defaultValue={params.get('q') ?? ''}
            onChange={e => update('q', e.target.value)}
          />
        </div>

        {/* Neighborhood */}
        <select className="input w-auto" defaultValue={params.get('neighborhood') ?? ''}
          onChange={e => update('neighborhood', e.target.value)}>
          <option value="">Any area</option>
          {SPRINGFIELD_NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
        </select>

        {/* Max rent */}
        <select className="input w-auto" defaultValue={params.get('max_rent') ?? ''}
          onChange={e => update('max_rent', e.target.value)}>
          <option value="">Any budget</option>
          <option value="50000">Under $500</option>
          <option value="75000">Under $750</option>
          <option value="100000">Under $1,000</option>
          <option value="150000">Under $1,500</option>
        </select>

        {/* Type */}
        <select className="input w-auto" defaultValue={params.get('type') ?? ''}
          onChange={e => update('type', e.target.value)}>
          <option value="">Any type</option>
          <option value="private_room">Private room</option>
          <option value="shared_room">Shared room</option>
          <option value="sublease">Sublease</option>
          <option value="whole_unit">Whole unit</option>
        </select>

        {/* Furnished toggle */}
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox"
            defaultChecked={params.get('furnished') === 'true'}
            onChange={e => update('furnished', e.target.checked ? 'true' : '')}
            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          Furnished
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox"
            defaultChecked={params.get('utilities') === 'true'}
            onChange={e => update('utilities', e.target.checked ? 'true' : '')}
            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          Bills incl.
        </label>

        <SlidersHorizontal size={16} className="text-gray-400 ml-auto"/>
      </div>
    </div>
  )
}
