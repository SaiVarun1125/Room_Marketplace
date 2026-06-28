import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Shield, CheckCircle, XCircle } from 'lucide-react'
import { formatRent, LISTING_TYPE_LABELS } from '@/lib/types'
import type { ListingType } from '@/lib/types'
import AdminActions from '@/components/admin/AdminActions'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const { data: pending } = await supabase
    .from('listings')
    .select(`*, profiles(full_name, school)`)
    .eq('status', 'pending_review')
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  const { data: reports } = await supabase
    .from('reports').select(`*, listings(title), profiles(full_name)`)
    .eq('status', 'open').order('created_at', { ascending: true }).limit(20)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
        <Shield size={22}/>Admin panel
      </h1>

      {/* Pending listings */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Pending review ({pending?.length ?? 0})
        </h2>
        {!pending?.length ? (
          <div className="card p-8 text-center text-gray-500">All caught up!</div>
        ) : (
          <div className="space-y-3">
            {pending.map((l: any) => (
              <div key={l.id} className="card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{l.title}</p>
                  <p className="text-sm text-gray-500">
                    {LISTING_TYPE_LABELS[l.type as ListingType]} · {formatRent(l.rent)} · by {l.profiles?.full_name}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(l.created_at).toLocaleString()}</p>
                </div>
                <Link href={`/listings/${l.id}`} className="btn-secondary text-xs">Preview</Link>
                <AdminActions listingId={l.id}/>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Open reports */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Open reports ({reports?.length ?? 0})
        </h2>
        {!reports?.length ? (
          <div className="card p-8 text-center text-gray-500">No open reports.</div>
        ) : (
          <div className="space-y-3">
            {reports.map((r: any) => (
              <div key={r.id} className="card p-4">
                <p className="font-medium text-gray-900">{r.listings?.title}</p>
                <p className="text-sm text-gray-600 mt-1">"{r.reason}"</p>
                <p className="text-xs text-gray-400 mt-1">Reported by {r.profiles?.full_name}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
