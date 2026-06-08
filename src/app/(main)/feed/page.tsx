'use client'
import { useState, useEffect } from 'react'
import PostComposer from '@/components/feed/PostComposer'
import PostCard from '@/components/feed/PostCard'
import type { Post, PostType, InteractionType } from '@/types'

export default function FeedPage() {
  const [posts, setPosts]         = useState<Post[]>([])
  const [loading, setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [nextCursor, setNextCursor]   = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/posts')
      .then((r) => r.json())
      .then((data) => {
        if (data.posts) setPosts(data.posts)
        setNextCursor(data.nextCursor ?? null)
      })
      .finally(() => setLoading(false))
  }, [])

  async function loadMore() {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    const res = await fetch(`/api/posts?cursor=${nextCursor}`)
    const data = await res.json()
    if (data.posts) setPosts((prev) => [...prev, ...data.posts])
    setNextCursor(data.nextCursor ?? null)
    setLoadingMore(false)
  }

  async function handlePublish(draft: {
    postType: PostType; content: string
    subjectTag?: string; projectTitle?: string; projectUrl?: string; thumbnailUrl?: string
  }) {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    })
    if (res.ok) {
      const newPost: Post = await res.json()
      setPosts((prev) => [newPost, ...prev])
    }
  }

  function handleInteract(postId: string, type: InteractionType) {
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
    fetch(`/api/posts/${postId}/interact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    })
  }

  function handleDelete(postId: string) {
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Cargando…</span>
      </div>
    )
  }

  return (
    <div>
      <PostComposer onPublish={handlePublish} />

      {posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Aún no hay publicaciones. ¡Sé el primero!
          </p>
        </div>
      )}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} onInteract={handleInteract} onDelete={handleDelete} />
      ))}

      {nextCursor && (
        <div className="flex justify-center py-6">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-5 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-surface)' }}
          >
            {loadingMore ? 'Cargando…' : 'Ver más publicaciones'}
          </button>
        </div>
      )}
    </div>
  )
}
