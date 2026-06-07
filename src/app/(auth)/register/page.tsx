'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { SCHOOLS } from '@/lib/uapa-data'
import { useAppStore } from '@/stores/appStore'
import { getDict } from '@/lib/i18n'

export default function RegisterPage() {
  const router = useRouter()
  const lang = useAppStore((s) => s.lang)
  const dict = getDict(lang)
  const a = dict.auth

  const [form, setForm] = useState({
    name: '', email: '', password: '', school: '', career: '',
  })
  const [showPw, setShowPw]   = useState(false)
  const [errors, setErrors]   = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading]  = useState(false)

  const careers = form.school ? SCHOOLS[form.school] ?? [] : []

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Requerido'
    if (!form.email.endsWith('@uapa.edu.do') && !form.email.endsWith('@p.uapa.edu.do')) e.email = a.email_hint
    if (form.password.length < 8) e.password = 'Mínimo 8 caracteres'
    if (!form.school) e.school = 'Requerido'
    if (!form.career) e.career = 'Requerido'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError('')
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      const data = await res.json()
      setApiError(data.error ?? 'Error al registrarse')
      setLoading(false)
      return
    }

    // Auto-login after successful registration
    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    setLoading(false)

    if (result?.ok) {
      router.push('/feed')
      router.refresh()
    } else {
      router.push('/login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--brand-primary)' }}
          >
            <UserPlus size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{a.register}</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>NEXO UAPA</p>
          </div>
        </div>

        {apiError && (
          <div
            className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm"
            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
          >
            <AlertCircle size={15} />
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label={a.name} error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="nexo-input"
              placeholder="Ej. Juan Pérez"
            />
          </Field>

          <Field label={a.email} error={errors.email} hint={a.email_hint}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="nexo-input"
              placeholder="nombre@p.uapa.edu.do"
            />
          </Field>

          <Field label={a.password} error={errors.password}>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="nexo-input pr-10"
                placeholder="••••••••"
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
          </Field>

          <Field label={a.school} error={errors.school}>
            <select
              value={form.school}
              onChange={(e) => setForm({ ...form, school: e.target.value, career: '' })}
              className="nexo-input"
            >
              <option value="">{a.select_school}</option>
              {Object.keys(SCHOOLS).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>

          <Field label={a.career} error={errors.career}>
            <select
              value={form.career}
              onChange={(e) => setForm({ ...form, career: e.target.value })}
              className="nexo-input"
              disabled={!form.school}
            >
              <option value="">{a.select_career}</option>
              {careers.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white mt-2 transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: 'var(--brand-primary)' }}
          >
            {loading ? 'Registrando…' : a.register}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          {a.have_account}{' '}
          <Link href="/login" className="font-medium hover:underline" style={{ color: 'var(--brand-primary)' }}>
            {a.login}
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
        .nexo-input:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  )
}

function Field({
  label, error, hint, children,
}: {
  label: string; error?: string; hint?: string; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      {children}
      {error && <span className="text-xs" style={{ color: '#ef4444' }}>{error}</span>}
      {!error && hint && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{hint}</span>}
    </div>
  )
}
