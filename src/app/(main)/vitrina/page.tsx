'use client'
import { useState, useEffect } from 'react'
import { Layers, ChevronDown } from 'lucide-react'
import PostCard from '@/components/feed/PostCard'
import { SCHOOLS } from '@/lib/uapa-data'
import type { Post, InteractionType } from '@/types'

const ALL_SCHOOLS = Object.keys(SCHOOLS)

export default function VitrinaPage() {
  const [posts, setPosts]         = useState<Post[]>([])
  const [loading, setLoading]     = useState(true)
  const [schoolFilter, setSchool] = useState('')
  const [sortBy, setSortBy]       = useState<'recent' | 'top'>('recent')

  useEffect(() => {
    setLoading(true)
    fetch('/api/posts?type=project&take=50')
      .then((r) => r.json())
      .then((data) => { if (data.posts) setPosts(data.posts) })
      .finally(() => setLoading(false))
  }, [])

  const displayed = posts
    .filter((p) => !schoolFilter || p.user.school === schoolFilter)
    .sort((a, b) =>
      sortBy === 'top'
        ? (b._count.upvotes + b._count.likes) - (a._count.upvotes + a._count.likes)
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

  async function handleInteract(postId: string, type: InteractionType) {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p
        const already = p.userInteractions?.includes(type)
        const delta = already ? -1 : 1
        return {
          ...p,
          userInteractions: already
            ? p.userInteractions!.filter((i) => i !== type)
            : [...(p.userInteractions ?? []), type],
          _count: {
            ...p._count,
            likes:   type === 'like'   ? p._count.likes   + delta : p._count.likes,
            upvotes: type === 'upvote' ? p._count.upvotes + delta : p._count.upvotes,
            reposts: type === 'repost' ? p._count.reposts + delta : p._count.reposts,
          },
        }
      })
    )
    await fetch(`/api/posts/${postId}/interact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    })
  }

  return (
    <div>
      {/* Header */}
      <div
        className="sticky top-0 z-10 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
      >
        <div className="flex items-center gap-2 px-4 py-3">
          <Layers size={18} style={{ color: 'var(--brand-primary)' }} />
          <h1 className="font-bold text-lg flex-1" style={{ color: 'var(--text-primary)' }}>
            Vitrina de Proyectos
          </h1>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}>
            {displayed.length}
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto">
          {/* Sort */}
          <div className="flex rounded-lg overflow-hidden border shrink-0" style={{ borderColor: 'var(--border)' }}>
            {(['recent', 'top'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className="px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  background: sortBy === s ? 'var(--brand-primary)' : 'var(--bg)',
                  color: sortBy === s ? '#fff' : 'var(--text-muted)',
                }}
              >
                {s === 'recent' ? 'Recientes' : 'Populares'}
              </button>
            ))}
          </div>

          {/* School filter */}
          <div className="relative shrink-0">
            <select
              value={schoolFilter}
              onChange={(e) => setSchool(e.target.value)}
              className="appearance-none text-xs px-3 py-1.5 pr-7 rounded-lg border outline-none"
              style={{
                borderColor: schoolFilter ? 'var(--brand-primary)' : 'var(--border)',
                background: schoolFilter ? 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' : 'var(--bg)',
                color: schoolFilter ? 'var(--brand-primary)' : 'var(--text-muted)',
              }}
            >
              <option value="">Todas las escuelas</option>
              {ALL_SCHOOLS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Cargando proyectos…</span>
        </div>
      )}

      {!loading && displayed.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Layers size={32} style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {schoolFilter ? `Sin proyectos de ${schoolFilter}` : 'Aún no hay proyectos. ¡Comparte el tuyo en el feed!'}
          </p>
          {schoolFilter && (
            <button onClick={() => setSchool('')} className="text-xs hover:underline" style={{ color: 'var(--brand-primary)' }}>
              Ver todos
            </button>
          )}
        </div>
      )}

      {displayed.map((p) => (
        <PostCard key={p.id} post={p} onInteract={handleInteract} />
      ))}
    </div>
  )
}
