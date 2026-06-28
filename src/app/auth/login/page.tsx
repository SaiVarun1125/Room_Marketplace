'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, Home } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'password' | 'magic'>('password')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/listings'
  const supabase = createClient()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')

    if (mode === 'password') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else { router.push(next); router.refresh() }
    } else {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${location.origin}/auth/callback?next=${next}` },
      })
      if (error) setError(error.message)
      else setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-semibold text-gray-900 mb-6">
            <Home size={20} className="text-brand-600"/>RoomMate <span className="text-brand-600">SGF</span>
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'password' ? 'Sign in with your email and password.' : 'We\'ll email you a magic link — no password needed.'}
          </p>
        </div>

        {sent ? (
          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={22} className="text-green-600"/>
            </div>
            <h2 className="font-semibold text-gray-900 mb-2">Check your email</h2>
            <p className="text-sm text-gray-600">We sent a magic link to <strong>{email}</strong>. Click it to sign in.</p>
          </div>
        ) : (
          <div className="card p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="label">Email address</label>
                <input
                  id="email" type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="input"
                />
              </div>
              {mode === 'password' && (
                <div>
                  <label htmlFor="password" className="label">Password</label>
                  <input
                    id="password" type="password" required value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input"
                  />
                </div>
              )}
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Signing in…' : mode === 'password' ? 'Sign in' : 'Send magic link'}
              </button>
            </form>
            <div className="mt-4 text-center">
              <button
                onClick={() => { setMode(mode === 'password' ? 'magic' : 'password'); setError('') }}
                className="text-sm text-brand-600 hover:underline"
              >
                {mode === 'password' ? 'Use magic link instead' : 'Use password instead'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
