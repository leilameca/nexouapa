'use client'
import { useState, useEffect, useRef } from 'react'
import { Sun, Moon, Globe, Save, GitFork, Link2, LogOut, Camera, Loader } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useAppStore } from '@/stores/appStore'
import { getDict } from '@/lib/i18n'
import type { Theme, Lang } from '@/types'

export default function SettingsPage() {
  const { data: session } = useSession()
  const { theme, lang, setTheme, setLang } = useAppStore()
  const dict = getDict(lang)
  const s = dict.settings

  const [profile, setProfile] = useState({ name: '', bio: '', github: '', linkedin: '' })
  const [avatarUrl, setAvatarUrl]           = useState<string | null>(null)
  const [saved, setSaved]                   = useState(false)
  const [loading, setLoading]               = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setProfile({
            name:     data.user.name        ?? '',
            bio:      data.user.bio         ?? '',
            github:   data.user.githubUrl   ?? '',
            linkedin: data.user.linkedinUrl ?? '',
          })
          setAvatarUrl(data.user.avatarUrl ?? null)
        }
      })
  }, [])

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (res.ok) {
      const { url } = await res.json()
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: url }),
      })
      setAvatarUrl(url)
    }
    setUploadingAvatar(false)
    e.target.value = ''
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:        profile.name,
        bio:         profile.bio,
        githubUrl:   profile.github,
        linkedinUrl: profile.linkedin,
      }),
    })
    setLoading(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <div className="py-6 px-4">
      <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        {s.title}
      </h1>

      {/* Account */}
      {session?.user && (
        <Section title="Cuenta">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-4">
            <button
              type="button"
              className="relative group"
              onClick={() => fileInputRef.current?.click()}
              title="Cambiar foto"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={profile.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
                  style={{ background: 'var(--brand-primary)' }}
                >
                  {profile.name[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              <div
                className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.45)' }}
              >
                {uploadingAvatar ? (
                  <Loader size={16} className="text-white animate-spin" />
                ) : (
                  <Camera size={16} className="text-white" />
                )}
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {session.user.name}
              </p>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                {session.user.email}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium hover:underline"
                style={{ color: 'var(--brand-primary)' }}
              >
                Cambiar foto
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              <LogOut size={13} />
              Cerrar sesión
            </button>
          </div>
        </Section>
      )}

      {/* Theme */}
      <Section title={s.theme}>
        <div className="flex gap-2 flex-wrap">
          {(['light', 'dark'] as Theme[]).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all"
              style={{
                borderColor: theme === t ? 'var(--brand-primary)' : 'var(--border)',
                background:  theme === t ? 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' : 'var(--bg)',
                color:       theme === t ? 'var(--brand-primary)' : 'var(--text-secondary)',
              }}
            >
              {t === 'light' ? <Sun size={15} /> : <Moon size={15} />}
              {t === 'light' ? s.light : s.dark}
            </button>
          ))}
        </div>
      </Section>

      {/* Language */}
      <Section title={s.language}>
        <div className="flex gap-2 flex-wrap">
          {(['es', 'en'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all"
              style={{
                borderColor: lang === l ? 'var(--brand-primary)' : 'var(--border)',
                background:  lang === l ? 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' : 'var(--bg)',
                color:       lang === l ? 'var(--brand-primary)' : 'var(--text-secondary)',
              }}
            >
              <Globe size={15} />
              {l === 'es' ? 'Español' : 'English'}
            </button>
          ))}
        </div>
      </Section>

      {/* Profile */}
      <Section title={s.profile}>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Field label={dict.auth.name}>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="nexo-input"
              placeholder="Tu nombre completo"
            />
          </Field>

          <Field label={s.bio}>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="nexo-input resize-none"
              rows={3}
              placeholder="Cuéntanos algo sobre ti..."
            />
          </Field>

          <Field label={s.github} icon={<GitFork size={13} />}>
            <input
              type="url"
              value={profile.github}
              onChange={(e) => setProfile({ ...profile, github: e.target.value })}
              className="nexo-input"
              placeholder="https://github.com/usuario"
            />
          </Field>

          <Field label={s.linkedin} icon={<Link2 size={13} />}>
            <input
              type="url"
              value={profile.linkedin}
              onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
              className="nexo-input"
              placeholder="https://linkedin.com/in/usuario"
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 self-start px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: saved ? '#22c55e' : 'var(--brand-primary)' }}
          >
            <Save size={15} />
            {saved ? dict.common.success : loading ? 'Guardando…' : s.save}
          </button>
        </form>
      </Section>

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="mb-5 rounded-xl p-4"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      <h2 className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: 'var(--text-muted)' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function Field({
  label, icon, children,
}: {
  label: string; icon?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
        {icon}
        {label}
      </label>
      {children}
    </div>
  )
}
