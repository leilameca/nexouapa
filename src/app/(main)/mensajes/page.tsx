'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageCircle, Search } from 'lucide-react'
import { ConversationSkeleton } from '@/components/ui/Skeleton'

interface ConvItem {
  id: string
  otherUser: { id: string; name: string; avatarUrl?: string | null; career: string } | null
  lastMsg: { text: string; createdAt: string; isRead: boolean; senderId: string } | null
  createdAt: string
}

function fmtTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Ayer'
  return d.toLocaleDateString('es-DO', { day: 'numeric', month: 'short' })
}

export default function MensajesPage() {
  const [convs, setConvs] = useState<ConvItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/conversations')
      .then((r) => r.json())
      .then((d) => setConvs(d.conversations ?? []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = search.trim()
    ? convs.filter((c) => c.otherUser?.name.toLowerCase().includes(search.toLowerCase()))
    : convs

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-4"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle size={18} style={{ color: 'var(--brand-primary)' }} />
          <h1 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
            Mensajes
          </h1>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
        >
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar conversaciones…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && Array.from({ length: 5 }).map((_, i) => <ConversationSkeleton key={i} />)}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <MessageCircle size={40} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {search ? 'Sin resultados' : 'No tienes mensajes aún.\nEntra a un perfil para iniciar un chat.'}
            </p>
          </div>
        )}

        {filtered.map((conv) => {
          if (!conv.otherUser) return null
          return (
            <Link
              key={conv.id}
              href={`/mensajes/${conv.id}`}
              className="flex items-center gap-3 px-4 py-3 border-b transition-colors block"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                {conv.otherUser.avatarUrl ? (
                  <img src={conv.otherUser.avatarUrl} alt={conv.otherUser.name} className="w-11 h-11 rounded-full object-cover" />
                ) : (
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: 'var(--brand-primary)' }}
                  >
                    {conv.otherUser.name[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {conv.otherUser.name}
                  </span>
                  {conv.lastMsg && (
                    <span className="text-xs shrink-0 ml-2" style={{ color: 'var(--text-muted)' }} suppressHydrationWarning>
                      {fmtTime(conv.lastMsg.createdAt)}
                    </span>
                  )}
                </div>
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {conv.lastMsg ? conv.lastMsg.text : conv.otherUser.career}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
