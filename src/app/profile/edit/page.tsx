'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { SPRINGFIELD_NEIGHBORHOODS } from '@/lib/types'

export default function EditProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    full_name:'', school:'', gender:'', gender_pref:'',
    budget_min:'', budget_max:'', bio:'', move_in_date:'',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => {
          if (data) setForm({
            full_name: data.full_name ?? '',
            school: data.school ?? '',
            gender: data.gender ?? '',
            gender_pref: data.gender_pref ?? '',
            budget_min: data.budget_min ? String(data.budget_min/100) : '',
            budget_max: data.budget_max ? String(data.budget_max/100) : '',
            bio: data.bio ?? '',
            move_in_date: data.move_in_date ?? '',
          })
        })
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({
      full_name: form.full_name,
      school: form.school || null,
      gender: form.gender || null,
      gender_pref: form.gender_pref || null,
      budget_min: form.budget_min ? Math.round(parseFloat(form.budget_min)*100) : null,
      budget_max: form.budget_max ? Math.round(parseFloat(form.budget_max)*100) : null,
      bio: form.bio || null,
      move_in_date: form.move_in_date || null,
    }).eq('id', user.id)
    setSaved(true); setLoading(false)
    setTimeout(() => { router.push('/profile') }, 1000)
  }

  const field = (key: keyof typeof form, label: string, type='text', placeholder='') => (
    <div><label className="label">{label}</label>
    <input type={type} value={form[key]} placeholder={placeholder}
      onChange={e => setForm(f => ({...f,[key]:e.target.value}))} className="input"/></div>
  )

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Edit profile</h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {field('full_name','Full name *','text','Your name')}
        {field('school','University / workplace','text','e.g. Missouri State University')}
        {field('gender','Gender (optional)','text','e.g. Female, Male, Non-binary')}
        <div><label className="label">Gender preference for roommates</label>
          <select value={form.gender_pref} onChange={e => setForm(f=>({...f,gender_pref:e.target.value}))} className="input">
            <option value="">No preference</option>
            <option value="Female only">Female only</option>
            <option value="Male only">Male only</option>
            <option value="Non-binary friendly">Non-binary friendly</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {field('budget_min','Min budget ($/mo)','number','400')}
          {field('budget_max','Max budget ($/mo)','number','900')}
        </div>
        {field('move_in_date','Earliest move-in date','date')}
        <div><label className="label">Bio</label>
          <textarea value={form.bio} onChange={e => setForm(f=>({...f,bio:e.target.value}))}
            rows={3} placeholder="A bit about yourself…" className="input resize-none"/>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {saved ? '✓ Saved!' : loading ? 'Saving…' : 'Save profile'}
          </button>
          <button type="button" onClick={() => router.push('/profile')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  )
}
