'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  ArrowLeft, Users, BookOpen, Send, Calendar, Plus, X, Trophy,
} from 'lucide-react'

interface GroupMember {
  id: string
  role: string
  joinedAt: string
  user: { id: string; name: string; avatarUrl?: string | null; career: string; school: string; reputationPoints: number }
}

interface GroupPostItem {
  id: string
  content: string
  createdAt: string
  user: { id: string; name: string; avatarUrl?: string | null; career: string }
}

interface GroupEventItem {
  id: string
  title: string
  description?: string | null
  scheduledAt: string
  user: { id: string; name: string; avatarUrl?: string | null }
}

interface GroupDetail {
  id: string
  name: string
  subject?: string | null
  description?: string | null
  createdBy: string
  isMember: boolean
  members: GroupMember[]
  _count: { members: number; posts: number; events: number }
}

type Tab = 'feed' | 'members' | 'events'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-DO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function fmtEvent(iso: string) {
  return new Date(iso).toLocaleDateString('es-DO', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function GroupPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const [group, setGroup] = useState<GroupDetail | null>(null)
  const [posts, setPosts]   = useState<GroupPostItem[]>([])
  const [events, setEvents] = useState<GroupEventItem[]>([])
  const [tab, setTab]       = useState<Tab>('feed')
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [postText, setPostText] = useState('')
  const [posting, setPosting]   = useState(false)
  const [joining, setJoining]   = useState(false)

  const [showEventForm, setShowEventForm] = useState(false)
  const [eventForm, setEventForm] = useState({ title: '', description: '', scheduledAt: '' })
  const [addingEvent, setAddingEvent] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/groups/${id}`),
      fetch(`/api/groups/${id}/posts`),
      fetch(`/api/groups/${id}/events`),
    ])
      .then(async ([gRes, pRes, eRes]) => {
        if (gRes.status === 404) { setNotFound(true); return }
        const [gData, pData, eData] = await Promise.all([gRes.json(), pRes.json(), eRes.json()])
        setGroup(gData.group)
        setPosts(pData.posts ?? [])
        setEvents(eData.events ?? [])
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  async function toggleJoin() {
    if (!session?.user?.id || joining) return
    setJoining(true)
    const res = await fetch(`/api/groups/${id}/join`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      setGroup((prev) => prev ? { ...prev, isMember: data.joined } : prev)
    }
    setJoining(false)
  }

  async function submitPost() {
    if (!postText.trim() || posting) return
    setPosting(true)
    const res = await fetch(`/api/groups/${id}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: postText.trim() }),
    })
    if (res.ok) {
      const data = await res.json()
      setPosts((prev) => [data.post, ...prev])
      setPostText('')
    }
    setPosting(false)
  }

  async function submitEvent() {
    if (!eventForm.title.trim() || !eventForm.scheduledAt || addingEvent) return
    setAddingEvent(true)
    const res = await fetch(`/api/groups/${id}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventForm),
    })
    if (res.ok) {
      const data = await res.json()
      setEvents((prev) => [...prev, data.event].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()))
      setShowEventForm(false)
      setEventForm({ title: '', description: '', scheduledAt: '' })
    }
    setAddingEvent(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center py-24"><span className="text-sm" style={{ color: 'var(--text-muted)' }}>Cargando grupo…</span></div>
  }
  if (notFound || !group) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Grupo no encontrado</p>
        <Link href="/grupos" className="text-sm hover:underline" style={{ color: 'var(--brand-primary)' }}>Volver a grupos</Link>
      </div>
    )
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'feed',    label: 'Feed',     count: group._count.posts },
    { key: 'members', label: 'Miembros', count: group._count.members },
    { key: 'events',  label: 'Eventos',  count: group._count.events },
  ]

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/grupos" className="p-1.5 rounded-full" style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{group.name}</p>
            {group.subject && (
              <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <BookOpen size={10} />{group.subject}
              </p>
            )}
          </div>
          <button
            onClick={toggleJoin}
            disabled={joining}
            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
            style={group.isMember
              ? { border: '1px solid var(--border)', color: 'var(--text-primary)', background: 'transparent' }
              : { background: 'var(--brand-primary)', color: '#fff' }
            }
          >
            {group.isMember ? 'Salir' : 'Unirse'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-t" style={{ borderColor: 'var(--border)' }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 py-3 text-sm font-medium border-b-2 transition-colors"
              style={{
                color: tab === t.key ? 'var(--brand-primary)' : 'var(--text-muted)',
                borderColor: tab === t.key ? 'var(--brand-primary)' : 'transparent',
              }}
            >
              {t.label} {t.count !== undefined && <span className="text-xs opacity-70">({t.count})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Feed tab */}
      {tab === 'feed' && (
        <div>
          {group.isMember && (
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <textarea
                rows={2}
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="Escribe algo en el grupo…"
                className="w-full text-sm rounded-xl px-3 py-2 resize-none outline-none"
                style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={submitPost}
                  disabled={!postText.trim() || posting}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium text-white disabled:opacity-40"
                  style={{ background: 'var(--brand-primary)' }}
                >
                  <Send size={13} />
                  {posting ? 'Publicando…' : 'Publicar'}
                </button>
              </div>
            </div>
          )}

          {posts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No hay publicaciones en este grupo aún.</p>
            </div>
          )}

          {posts.map((p) => (
            <article key={p.id} className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex gap-3">
                <Link href={`/perfil/${p.user.id}`} className="shrink-0">
                  {p.user.avatarUrl ? (
                    <img src={p.user.avatarUrl} alt={p.user.name} className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--brand-primary)' }}>
                      {p.user.name[0]?.toUpperCase()}
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/perfil/${p.user.id}`} className="text-sm font-semibold hover:underline" style={{ color: 'var(--text-primary)' }}>{p.user.name}</Link>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.user.career}</span>
                    <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }} suppressHydrationWarning>{fmtDate(p.createdAt)}</span>
                  </div>
                  <p className="text-sm mt-1 leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{p.content}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Members tab */}
      {tab === 'members' && (
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {group.members.map((m) => (
            <Link key={m.id} href={`/perfil/${m.user.id}`} className="flex items-center gap-3 px-4 py-3 block transition-colors">
              {m.user.avatarUrl ? (
                <img src={m.user.avatarUrl} alt={m.user.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: 'var(--brand-primary)' }}>
                  {m.user.name[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{m.user.name}</span>
                  {m.role === 'admin' && (
                    <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)', color: 'var(--brand-primary)' }}>
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{m.user.career} · {m.user.school}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Trophy size={11} style={{ color: 'var(--brand-accent)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--brand-accent)' }}>{m.user.reputationPoints}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Events tab */}
      {tab === 'events' && (
        <div>
          {group.isMember && (
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              {!showEventForm ? (
                <button
                  onClick={() => setShowEventForm(true)}
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--brand-primary)' }}
                >
                  <Plus size={14} />
                  Programar sesión de estudio
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Nueva sesión</span>
                    <button onClick={() => setShowEventForm(false)}><X size={14} style={{ color: 'var(--text-muted)' }} /></button>
                  </div>
                  <input
                    type="text"
                    placeholder="Título de la sesión *"
                    value={eventForm.title}
                    onChange={(e) => setEventForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-lg outline-none"
                    style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                  />
                  <input
                    type="text"
                    placeholder="Descripción (opcional)"
                    value={eventForm.description}
                    onChange={(e) => setEventForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-lg outline-none"
                    style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                  />
                  <input
                    type="datetime-local"
                    value={eventForm.scheduledAt}
                    onChange={(e) => setEventForm((p) => ({ ...p, scheduledAt: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-lg outline-none"
                    style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                  />
                  <button
                    onClick={submitEvent}
                    disabled={!eventForm.title.trim() || !eventForm.scheduledAt || addingEvent}
                    className="w-full py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
                    style={{ background: 'var(--brand-primary)' }}
                  >
                    {addingEvent ? 'Agregando…' : 'Crear sesión'}
                  </button>
                </div>
              )}
            </div>
          )}

          {events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Calendar size={36} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No hay sesiones programadas.</p>
            </div>
          )}

          {events.map((ev) => (
            <div key={ev.id} className="flex items-start gap-3 px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'color-mix(in srgb, var(--brand-accent) 15%, transparent)' }}
              >
                <Calendar size={16} style={{ color: 'var(--brand-accent)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{ev.title}</p>
                <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--brand-accent)' }} suppressHydrationWarning>
                  {fmtEvent(ev.scheduledAt)}
                </p>
                {ev.description && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{ev.description}</p>}
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Organizado por {ev.user.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
