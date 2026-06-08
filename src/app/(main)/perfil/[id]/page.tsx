'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { GitFork, Link2, Trophy, ArrowLeft, BookOpen } from 'lucide-react'
import PostCard from '@/components/feed/PostCard'
import type { Post, InteractionType } from '@/types'

interface UserProfile {
  id: string
  name: string
  school: string
  career: string
  bio?: string | null
  avatarUrl?: string | null
  githubUrl?: string | null
  linkedinUrl?: string | null
  reputationPoints: number
  createdAt: string
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [user, setUser]   = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/user/${id}`),
      fetch(`/api/posts?userId=${id}`),
    ])
      .then(async ([uRes, pRes]) => {
        if (uRes.status === 404) { setNotFound(true); return }
        const [uData, pData] = await Promise.all([uRes.json(), pRes.json()])
        setUser(uData.user)
        setPosts(pData.posts ?? [])
      })
      .finally(() => setLoading(false))
  }, [id])

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Cargando perfil…</span>
      </div>
    )
  }

  if (notFound || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Usuario no encontrado</p>
        <Link href="/feed" className="text-sm hover:underline" style={{ color: 'var(--brand-primary)' }}>
          Volver al feed
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Back button */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
      >
        <Link
          href="/feed"
          className="p-1.5 rounded-full transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={18} />
        </Link>
        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          {user.name}
        </span>
      </div>

      {/* Header */}
      <div className="px-4 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-start gap-4">
          {/* Avatar */}
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
              style={{ background: 'var(--brand-primary)' }}
            >
              {user.name[0]?.toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {user.name}
            </h1>

            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <BookOpen size={12} style={{ color: 'var(--text-muted)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {user.career} · {user.school}
              </span>
            </div>

            <div className="flex items-center gap-1 mt-1">
              <Trophy size={12} style={{ color: 'var(--brand-accent)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--brand-accent)' }}>
                {user.reputationPoints} pts
              </span>
            </div>
          </div>
        </div>

        {user.bio && (
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {user.bio}
          </p>
        )}

        {/* Links */}
        {(user.githubUrl || user.linkedinUrl) && (
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {user.githubUrl && (
              <a
                href={user.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs hover:underline"
                style={{ color: 'var(--brand-primary)' }}
              >
                <GitFork size={13} />
                GitHub
              </a>
            )}
            {user.linkedinUrl && (
              <a
                href={user.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs hover:underline"
                style={{ color: 'var(--brand-primary)' }}
              >
                <Link2 size={13} />
                LinkedIn
              </a>
            )}
          </div>
        )}
      </div>

      {/* Posts */}
      <div>
        {posts.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Este usuario aún no ha publicado nada.
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onInteract={handleInteract} />
          ))
        )}
      </div>
    </div>
  )
}
