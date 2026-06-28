'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { SPRINGFIELD_NEIGHBORHOODS } from '@/lib/types'

export default function NewListingPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError('')
    const fd = new FormData(e.currentTarget)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login?next=/listings/new'); return }

    const rentDollars = parseFloat(fd.get('rent') as string)
    const depositDollars = parseFloat(fd.get('deposit') as string) || 0

    const { data: listing, error: err } = await supabase.from('listings').insert({
      owner_id:           user.id,
      title:              fd.get('title') as string,
      type:               fd.get('type') as string,
      status:             'pending_review',
      neighborhood:       fd.get('neighborhood') as string,
      city:               'Springfield',
      state:              'MO',
      zipcode:            fd.get('zipcode') as string,
      rent:               Math.round(rentDollars * 100),
      deposit:            depositDollars ? Math.round(depositDollars * 100) : null,
      utilities_included: fd.get('utilities') === 'on',
      furnished:          fd.get('furnished') === 'on',
      private_room:       fd.get('private_room') === 'on',
      gender_pref:        fd.get('gender_pref') as string || null,
      available_from:     fd.get('available_from') as string,
      available_to:       fd.get('available_to') as string || null,
      description:        fd.get('description') as string,
    }).select('id').single()

    if (err || !listing) { setError(err?.message ?? 'Failed to create listing'); setLoading(false); return }

    // Create compliance record
    await supabase.from('listing_compliance').insert({
      listing_id:                  listing.id,
      landlord_consent_required:   fd.get('consent_required') === 'on',
      landlord_consent_available:  fd.get('consent_available') === 'on',
      lease_doc_available:         fd.get('lease_doc') === 'on',
      prime_tenant_confirmed:      fd.get('prime_tenant') === 'on',
    })

    router.push(`/listings/${listing.id}`)
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="card p-6 space-y-4">
      <h2 className="font-semibold text-gray-900 text-lg">{title}</h2>
      {children}
    </div>
  )

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div><label className="label">{label}</label>{children}</div>
  )

  const Checkbox = ({ name, label }: { name: string; label: string }) => (
    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
      <input type="checkbox" name={name} className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"/>
      {label}
    </label>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Post a listing</h1>
      <p className="text-sm text-gray-500 mb-8">Your listing will be reviewed before going live. Usually within a few hours.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Basic info">
          <Field label="Listing title *">
            <input name="title" required placeholder="e.g. Sunny private room near Missouri State" className="input"/>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Room type *">
              <select name="type" required className="input">
                <option value="private_room">Private room</option>
                <option value="shared_room">Shared room</option>
                <option value="sublease">Sublease</option>
                <option value="lease_transfer">Lease transfer</option>
                <option value="whole_unit">Whole unit</option>
              </select>
            </Field>
            <Field label="Neighborhood">
              <select name="neighborhood" className="input">
                <option value="">Select area…</option>
                {SPRINGFIELD_NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </Field>
          </div>
          <Field label="ZIP code">
            <input name="zipcode" placeholder="65801" maxLength={5} className="input"/>
          </Field>
          <Field label="Description">
            <textarea name="description" rows={4} placeholder="Tell seekers about the room, house rules, neighbourhood..." className="input resize-none"/>
          </Field>
        </Section>

        <Section title="Pricing">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Monthly rent (USD) *">
              <input name="rent" type="number" required min={1} step="0.01" placeholder="600" className="input"/>
            </Field>
            <Field label="Security deposit (USD)">
              <input name="deposit" type="number" min={0} step="0.01" placeholder="600" className="input"/>
            </Field>
          </div>
        </Section>

        <Section title="Availability">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Available from *">
              <input name="available_from" type="date" required className="input"/>
            </Field>
            <Field label="Available to (optional)">
              <input name="available_to" type="date" className="input"/>
            </Field>
          </div>
        </Section>

        <Section title="Room details">
          <div className="grid grid-cols-2 gap-3">
            <Checkbox name="furnished" label="Furnished"/>
            <Checkbox name="utilities" label="Utilities included"/>
            <Checkbox name="private_room" label="Private room"/>
          </div>
          <Field label="Gender preference (optional)">
            <select name="gender_pref" className="input">
              <option value="">No preference</option>
              <option value="Female only">Female only</option>
              <option value="Male only">Male only</option>
              <option value="Non-binary friendly">Non-binary friendly</option>
            </select>
          </Field>
        </Section>

        <Section title="Lease & compliance">
          <div className="space-y-3">
            <Checkbox name="consent_required" label="Landlord consent is required for subletting"/>
            <Checkbox name="consent_available" label="Landlord consent is already obtained"/>
            <Checkbox name="lease_doc" label="Lease document available to share"/>
            <Checkbox name="prime_tenant" label="I am the prime tenant on the lease"/>
          </div>
          <p className="text-xs text-gray-400">Always ensure your sublease complies with Missouri landlord-tenant law.</p>
        </Section>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Submitting…' : 'Submit for review'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  )
}
