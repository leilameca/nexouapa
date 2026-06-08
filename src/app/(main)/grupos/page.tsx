'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Users, Plus, BookOpen, X, Search } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'

interface GroupItem {
  id: string
  name: string
  subject?: string | null
  description?: string | null
  isMember: boolean
  createdAt: string
  creator: { id: string; name: string; avatarUrl?: string | null }
  _count: { members: number; posts: number }
}

export default function GruposPage() {
  const { data: session } = useSession()
  const [groups, setGroups] = useState<GroupItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', subject: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [joiningId, setJoiningId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/groups')
      .then((r) => r.json())
      .then((d) => setGroups(d.groups ?? []))
      .finally(() => setLoading(false))
  }, [])

  async function createGroup() {
    if (!form.name.trim() || submitting) return
    setSubmitting(true)
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const data = await res.json()
      setGroups((prev) => [data.group, ...prev])
      setCreating(false)
      setForm({ name: '', subject: '', description: '' })
    }
    setSubmitting(false)
  }

  async function toggleJoin(groupId: string) {
    if (!session?.user?.id || joiningId) return
    setJoiningId(groupId)
    const res = await fetch(`/api/groups/${groupId}/join`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      setGroups((prev) => prev.map((g) =>
        g.id === groupId
          ? { ...g, isMember: data.joined, _count: { ...g._count, members: g._count.members + (data.joined ? 1 : -1) } }
          : g,
      ))
    }
    setJoiningId(null)
  }

  const filtered = search.trim()
    ? groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()) || g.subject?.toLowerCase().includes(search.toLowerCase()))
    : groups

  return (
    <div>
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-4"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users size={18} style={{ color: 'var(--brand-primary)' }} />
            <h1 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Grupos de Estudio</h1>
          </div>
          {session?.user && (
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white"
              style={{ background: 'var(--brand-primary)' }}
            >
              <Plus size={13} />
              <span className="hidden sm:inline">Nuevo</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <Search size={13} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar grupos…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Create form */}
      {creating && (
        <div className="m-4 rounded-xl p-4 space-y-3" style={{ border: '1px solid var(--border)', background: 'var(--bg)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Nuevo grupo</span>
            <button onClick={() => setCreating(false)}><X size={15} style={{ color: 'var(--text-muted)' }} /></button>
          </div>
          {(['name', 'subject', 'description'] as const).map((field) => (
            <input
              key={field}
              type="text"
              placeholder={{ name: 'Nombre del grupo *', subject: 'Asignatura (ej. Cálculo I)', description: 'Descripción breve' }[field]}
              value={form[field]}
              onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
              className="w-full text-sm px-3 py-2 rounded-lg outline-none"
              style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
            />
          ))}
          <button
            onClick={createGroup}
            disabled={!form.name.trim() || submitting}
            className="w-full py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: 'var(--brand-primary)' }}
          >
            {submitting ? 'Creando…' : 'Crear grupo'}
          </button>
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="p-4 grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl p-4 space-y-2" style={{ border: '1px solid var(--border)' }}>
              <Skeleton className="h-4 w-2/5 rounded" />
              <Skeleton className="h-3 w-1/3 rounded" />
              <Skeleton className="h-3 w-full rounded" />
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && !creating && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Users size={40} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
          <p className="text-sm text-center px-6" style={{ color: 'var(--text-muted)' }}>
            {search ? 'Sin resultados' : 'No hay grupos todavía. ¡Crea el primero!'}
          </p>
        </div>
      )}

      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {filtered.map((group) => (
          <div key={group.id} className="flex items-start gap-3 px-4 py-4">
            {/* Icon */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)' }}
            >
              <Users size={18} style={{ color: 'var(--brand-primary)' }} />
            </div>

            <div className="flex-1 min-w-0">
              <Link href={`/grupos/${group.id}`} className="text-sm font-semibold hover:underline block truncate" style={{ color: 'var(--text-primary)' }}>
                {group.name}
              </Link>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                {group.subject && (
                  <span className="flex items-center gap-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <BookOpen size={10} />
                    {group.subject}
                  </span>
                )}
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {group._count.members} miembros · {group._count.posts} publicaciones
                </span>
              </div>
              {group.description && (
                <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{group.description}</p>
              )}
            </div>

            <button
              onClick={() => toggleJoin(group.id)}
              disabled={joiningId === group.id || !session?.user}
              className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
              style={group.isMember
                ? { border: '1px solid var(--border)', color: 'var(--text-primary)', background: 'transparent' }
                : { background: 'var(--brand-primary)', color: '#fff', border: '1px solid transparent' }
              }
            >
              {group.isMember ? 'Salir' : 'Unirse'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
