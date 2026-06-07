'use client'
import { useState, useEffect } from 'react'
import { Layers } from 'lucide-react'
import PostCard from '@/components/feed/PostCard'
import type { Post, InteractionType } from '@/types'

export default function VitrinaPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/posts?type=project')
      .then((r) => r.json())
      .then((data) => { if (data.posts) setPosts(data.posts) })
      .finally(() => setLoading(false))
  }, [])

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
      <div
        className="flex items-center gap-2 p-4 border-b sticky top-0 z-10"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
      >
        <Layers size={18} style={{ color: 'var(--brand-primary)' }} />
        <h1 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Vitrina de Proyectos</h1>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Cargando…</span>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <Layers size={32} style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Aún no hay proyectos publicados. ¡Comparte el tuyo en el feed!
          </p>
        </div>
      )}

      {posts.map((p) => (
        <PostCard key={p.id} post={p} onInteract={handleInteract} />
      ))}
    </div>
  )
}
