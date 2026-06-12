import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'

export function AuthScreen() {
  const [email, setEmail]   = useState('')
  const [status, setStatus] = useState(null) // null | 'loading' | 'sent' | 'error'

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    setStatus(error ? 'error' : 'sent')
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-[var(--color-bg)]">
      {/* Logo */}
      <div className="mb-8 text-center animate-in">
        <div className="text-6xl mb-4">🏓</div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">
          TT<span className="text-[var(--color-table-600)]">·</span>Baukasten
        </h1>
        <p className="text-[var(--color-sub)] text-sm mt-1">TV Bonn-Geislar · Jugendtraining</p>
      </div>

      {/* Netz-Trennlinie */}
      <div className="tt-net w-full max-w-xs mb-8" />

      {status === 'sent' ? (
        <div className="text-center animate-in">
          <div className="text-4xl mb-3">📬</div>
          <p className="font-semibold text-[var(--color-ink)]">Magic Link gesendet!</p>
          <p className="text-sm text-[var(--color-sub)] mt-1">Prüf deine E-Mails und klick den Link.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3 animate-in">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="name@beispiel.de"
            autoComplete="email"
            required
            className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-table-500)] transition"
          />
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Sende…' : 'Magic Link senden'}
          </Button>
          {status === 'error' && (
            <p className="text-center text-sm text-red-500">Fehler — versuch es nochmal.</p>
          )}
        </form>
      )}
    </div>
  )
}
