import { useState } from 'react'
import { EnvelopeOpen } from '@phosphor-icons/react'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { AppIcon } from '../../components/layout/AppIcon'

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
    <div className="wallpaper min-h-dvh flex items-center justify-center px-5">
      <div className="glass-modal w-full max-w-[360px] rounded-[22px] shadow-[var(--shadow-window)] px-7 py-8 animate-modal">

        {/* App-Identität */}
        <div className="flex flex-col items-center text-center mb-7">
          <AppIcon size={64} />
          <h1 className="text-[19px] font-semibold tracking-[-0.01em] text-[var(--color-ink)] mt-4">
            TT-Baukasten
          </h1>
          <p className="text-[12px] text-[var(--color-muted)] mt-0.5">TV Bonn-Geislar · Jugendtraining</p>
        </div>

        {status === 'sent' ? (
          <div className="flex flex-col items-center text-center animate-in py-2">
            <EnvelopeOpen size={32} weight="duotone" className="text-[var(--color-table-600)] mb-3" />
            <p className="text-[14px] font-semibold text-[var(--color-ink)]">Magic Link gesendet</p>
            <p className="text-[12px] text-[var(--color-sub)] mt-1">Prüf deine E-Mails und klick den Link.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@beispiel.de"
              autoComplete="email"
              required
              className="w-full h-[38px] px-3.5 rounded-[10px] bg-white text-[13px] text-[var(--color-ink)]
                shadow-[0_0_0_0.5px_rgba(0,0,0,.16),inset_0_1px_2px_rgba(0,0,0,.04)]
                placeholder:text-[var(--color-muted)]
                focus:outline-none focus:ring-[3px] focus:ring-[var(--color-table-500)]/40 transition"
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
              <p className="text-center text-[12px] text-[#e0352b]">Fehler — versuch es nochmal.</p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
