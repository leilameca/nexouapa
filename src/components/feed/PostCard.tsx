'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  MessageCircle, Repeat2, Heart, ChevronUp, ExternalLink,
  HelpCircle, Layers, FileText, Send,
} from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { getDict } from '@/lib/i18n'
import type { Post, InteractionType } from '@/types'

const TYPE_META = {
  general:  { Icon: FileText,   color: '#6b7280' },
  question: { Icon: HelpCircle, color: '#3b82f6' },
  project:  { Icon: Layers,     color: '#8b5cf6' },
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-DO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function Avatar({ name, url, userId }: { name: string; url?: string | null; userId: string }) {
  return (
    <Link href={`/perfil/${userId}`} className="shrink-0 block">
      {url ? (
        <img src={url} alt={name} className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={{ background: 'var(--brand-primary)' }}
        >
          {name[0]?.toUpperCase()}
        </div>
      )}
    </Link>
  )
}

interface CommentData {
  id: string
  commentText: string
  createdAt?: string
  user: { id: string; name: string; avatarUrl?: string | null; career: string }
}

interface Props {
  post: Post
  onInteract?: (postId: string, type: InteractionType) => void
}

export default function PostCard({ post, onInteract }: Props) {
  const lang = useAppStore((s) => s.lang)
  const dict = getDict(lang)
  const f = dict.feed

  const [showComments, setShowComments] = useState(false)
  const [comments, setComments]         = useState<CommentData[]>([])
  const [commentText, setCommentText]   = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [sending, setSending]           = useState(false)
  const [commentCount, setCommentCount] = useState(post._count.comments)

  const { Icon, color } = TYPE_META[post.postType as keyof typeof TYPE_META] ?? TYPE_META.general
  const isUpvotable = post.postType === 'question' || post.postType === 'project'

  async function toggleComments() {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true)
      const res = await fetch(`/api/posts/${post.id}/comments`)
      if (res.ok) {
        const data = await res.json()
        setComments(data.comments ?? [])
      }
      setLoadingComments(false)
    }
    setShowComments((v) => !v)
  }

  async function submitComment() {
    if (!commentText.trim() || sending) return
    setSending(true)
    const res = await fetch(`/api/posts/${post.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: commentText.trim() }),
    })
    if (res.ok) {
      const data = await res.json()
      setComments((prev) => [...prev, data.comment])
      setCommentCount((n) => n + 1)
      setCommentText('')
    }
    setSending(false)
  }

  return (
    <article
      className="p-4 border-b transition-colors"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
    >
      <div className="flex gap-3">
        <Avatar name={post.user.name} url={post.user.avatarUrl} userId={post.user.id} />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/perfil/${post.user.id}`}
              className="font-semibold text-sm hover:underline"
              style={{ color: 'var(--text-primary)' }}
            >
              {post.user.name}
            </Link>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {post.user.career}
            </span>
            <span className="text-xs ml-auto shrink-0" style={{ color: 'var(--text-muted)' }} suppressHydrationWarning>
              {fmtDate(post.createdAt)}
            </span>
          </div>

          {/* Type badge */}
          <div className="flex items-center gap-1 mt-0.5 mb-2">
            <Icon size={11} style={{ color }} />
            {post.subjectTag && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: `${color}18`, color }}
              >
                {post.subjectTag}
              </span>
            )}
          </div>

          {/* Project link */}
          {post.postType === 'project' && post.projectUrl && (
            <div className="mb-2">
              <a
                href={post.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm font-medium hover:underline"
                style={{ color: 'var(--brand-primary)' }}
              >
                <ExternalLink size={13} />
                {post.projectTitle ?? post.projectUrl}
              </a>
            </div>
          )}

          {/* Content */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
            {post.content}
          </p>

          {/* Image */}
          {post.thumbnailUrl && (
            <img
              src={post.thumbnailUrl}
              alt="Imagen adjunta"
              className="mt-2 rounded-xl w-full object-cover max-h-72 cursor-pointer"
              onClick={() => window.open(post.thumbnailUrl!, '_blank')}
            />
          )}

          {/* Action bar */}
          <div className="flex items-center gap-5 mt-3">
            <ActionBtn
              icon={<MessageCircle size={15} />}
              count={commentCount}
              label={f.comment}
              active={showComments}
              activeColor="var(--brand-primary)"
              onClick={toggleComments}
            />
            <ActionBtn
              icon={<Repeat2 size={15} />}
              count={post._count.reposts}
              label={f.repost}
              active={post.userInteractions?.includes('repost')}
              activeColor="#22c55e"
              onClick={() => onInteract?.(post.id, 'repost')}
            />
            <ActionBtn
              icon={<Heart size={15} />}
              count={post._count.likes}
              label={f.like}
              active={post.userInteractions?.includes('like')}
              activeColor="#ef4444"
              onClick={() => onInteract?.(post.id, 'like')}
            />
            {isUpvotable && (
              <ActionBtn
                icon={<ChevronUp size={15} />}
                count={post._count.upvotes}
                label={f.upvote}
                active={post.userInteractions?.includes('upvote')}
                activeColor="var(--brand-accent)"
                onClick={() => onInteract?.(post.id, 'upvote')}
              />
            )}
          </div>

          {/* Comments section */}
          {showComments && (
            <div className="mt-3 space-y-3">
              {loadingComments && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Cargando comentarios…</p>
              )}
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <Link href={`/perfil/${c.user.id}`} className="shrink-0">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: 'var(--brand-primary)' }}
                    >
                      {c.user.name[0]?.toUpperCase()}
                    </div>
                  </Link>
                  <div
                    className="flex-1 rounded-xl px-3 py-2"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                  >
                    <Link
                      href={`/perfil/${c.user.id}`}
                      className="text-xs font-semibold hover:underline"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {c.user.name}
                    </Link>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-primary)' }}>{c.commentText}</p>
                  </div>
                </div>
              ))}

              {/* Comment input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                  placeholder={`${f.reply}…`}
                  className="flex-1 text-sm rounded-lg px-3 py-1.5 outline-none"
                  style={{
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text-primary)',
                  }}
                />
                <button
                  onClick={submitComment}
                  disabled={!commentText.trim() || sending}
                  className="px-3 py-1.5 rounded-lg text-white disabled:opacity-40"
                  style={{ background: 'var(--brand-primary)' }}
                >
                  <Send size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function ActionBtn({
  icon, count, label, active, activeColor = 'var(--brand-primary)', onClick,
}: {
  icon: React.ReactNode
  count: number
  label: string
  active?: boolean
  activeColor?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs transition-colors group"
      style={{ color: active ? activeColor : 'var(--text-muted)' }}
      title={label}
    >
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      <span>{count}</span>
    </button>
  )
}
