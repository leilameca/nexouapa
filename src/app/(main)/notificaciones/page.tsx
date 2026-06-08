'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, Heart, MessageCircle, UserPlus, AtSign, ChevronUp, Reply } from 'lucide-react'

interface Notif {
  id: string
  type: string
  message: string
  postId?: string | null
  isRead: boolean
  createdAt: string
  sender: { id: string; name: string; avatarUrl?: string | null }
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  like:    <Heart    size={14} style={{ color: '#ef4444' }} />,
  upvote:  <ChevronUp size={14} style={{ color: '#f59e0b' }} />,
  comment: <MessageCircle size={14} style={{ color: '#3b82f6' }} />,
  reply:   <Reply    size={14} style={{ color: '#6366f1' }} />,
  follow:  <UserPlus  size={14} style={{ color: '#22c55e' }} />,
  mention: <AtSign   size={14} style={{ color: '#8b5cf6' }} />,
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-DO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => setNotifs(d.notifications ?? []))
      .finally(() => setLoading(false))

    // Mark all as read
    fetch('/api/notifications', { method: 'PATCH' })
  }, [])

  return (
    <div>
      <div
        className="sticky top-0 z-10 px-4 py-4 flex items-center gap-3"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
      >
        <Bell size={18} style={{ color: 'var(--brand-primary)' }} />
        <h1 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
          Notificaciones
        </h1>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Cargando…</span>
        </div>
      )}

      {!loading && notifs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Bell size={36} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No tienes notificaciones todavía.</p>
        </div>
      )}

      <div>
        {notifs.map((n) => {
          const icon = TYPE_ICON[n.type] ?? <Bell size={14} />
          const href = n.postId ? `/feed#${n.postId}` : `/perfil/${n.sender.id}`
          return (
            <Link
              key={n.id}
              href={href}
              className="flex items-start gap-3 px-4 py-3 border-b transition-colors block"
              style={{
                borderColor: 'var(--border)',
                background: n.isRead ? 'var(--bg-surface)' : 'color-mix(in srgb, var(--brand-primary) 6%, var(--bg-surface))',
              }}
            >
              {/* Sender avatar */}
              <div className="relative shrink-0">
                {n.sender.avatarUrl ? (
                  <img src={n.sender.avatarUrl} alt={n.sender.name} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: 'var(--brand-primary)' }}
                  >
                    {n.sender.name[0]?.toUpperCase()}
                  </div>
                )}
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-surface)' }}
                >
                  {icon}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>
                  {n.message}
                </p>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }} suppressHydrationWarning>
                  {fmtDate(n.createdAt)}
                </span>
              </div>

              {!n.isRead && (
                <span className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: 'var(--brand-primary)' }} />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
