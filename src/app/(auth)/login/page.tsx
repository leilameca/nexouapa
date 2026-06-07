'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { getDict } from '@/lib/i18n'

export default function LoginPage() {
  const router = useRouter()
  const lang = useAppStore((s) => s.lang)
  const dict = getDict(lang)
  const a = dict.auth

  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.ok) {
      router.push('/feed')
      router.refresh()
    } else {
      setError('Correo o contraseña incorrectos')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--brand-primary)' }}
          >
            <LogIn size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{a.login}</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>NEXO UAPA</p>
          </div>
        </div>

        {error && (
          <div
            className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm"
            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
          >
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{a.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="nexo-input"
              placeholder="nombre@p.uapa.edu.do"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{a.password}</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="nexo-input pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white mt-2 transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: 'var(--brand-primary)' }}
          >
            {loading ? 'Ingresando…' : a.login}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          {a.no_account}{' '}
          <Link href="/register" className="font-medium hover:underline" style={{ color: 'var(--brand-primary)' }}>
            {a.register}
          </Link>
        </p>
      </div>

      <style>{`
        .nexo-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text-primary);
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .nexo-input:focus { border-color: var(--brand-primary); }
      `}</style>
    </div>
  )
}
