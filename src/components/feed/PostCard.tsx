'use client'
import { useState } from 'react'
import {
  MessageCircle, Repeat2, Heart, ChevronUp, ExternalLink,
  HelpCircle, Layers, FileText,
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

function Avatar({ name, url }: { name: string; url?: string }) {
  if (url) return <img src={url} alt={name} className="w-10 h-10 rounded-full object-cover" />
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
      style={{ background: 'var(--brand-primary)' }}
    >
      {name[0]?.toUpperCase()}
    </div>
  )
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
  const [commentText, setCommentText] = useState('')

  const { Icon, color } = TYPE_META[post.postType]
  const isUpvotable = post.postType === 'question' || post.postType === 'project'

  function interact(type: InteractionType) {
    onInteract?.(post.id, type)
  }

  return (
    <article
      className="p-4 border-b transition-colors"
      style={{
        borderColor: 'var(--border)',
        background: 'var(--bg-surface)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
    >
      <div className="flex gap-3">
        <Avatar name={post.user.name} url={post.user.avatarUrl} />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {post.user.name}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {post.user.career}
            </span>
            <span className="text-xs ml-auto flex-shrink-0" style={{ color: 'var(--text-muted)' }} suppressHydrationWarning>
              {fmtDate(post.createdAt)}
            </span>
          </div>

          {/* Type badge */}
          <div className="flex items-center gap-1 mt-0.5 mb-2">
            <Icon size={11} style={{ color }} />
            {post.subjectTag && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: `${color}18`,
                  color,
                }}
              >
                {post.subjectTag}
              </span>
            )}
          </div>

          {/* Project title */}
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
                {post.projectUrl}
              </a>
            </div>
          )}

          {/* Content */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
            {post.content}
          </p>

          {/* Project thumbnail */}
          {post.thumbnailUrl && (
            <img
              src={post.thumbnailUrl}
              alt="Project thumbnail"
              className="mt-2 rounded-xl w-full object-cover max-h-52"
            />
          )}

          {/* Action bar */}
          <div className="flex items-center gap-5 mt-3">
            <ActionBtn
              icon={<MessageCircle size={15} />}
              count={post._count.comments}
              label={f.comment}
              active={false}
              onClick={() => setShowComments(!showComments)}
            />
            <ActionBtn
              icon={<Repeat2 size={15} />}
              count={post._count.reposts}
              label={f.repost}
              active={post.userInteractions?.includes('repost')}
              activeColor="#22c55e"
              onClick={() => interact('repost')}
            />
            <ActionBtn
              icon={<Heart size={15} />}
              count={post._count.likes}
              label={f.like}
              active={post.userInteractions?.includes('like')}
              activeColor="#ef4444"
              onClick={() => interact('like')}
            />
            {isUpvotable && (
              <ActionBtn
                icon={<ChevronUp size={15} />}
                count={post._count.upvotes}
                label={f.upvote}
                active={post.userInteractions?.includes('upvote')}
                activeColor="var(--brand-accent)"
                onClick={() => interact('upvote')}
              />
            )}
          </div>

          {/* Comment input */}
          {showComments && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={`${f.reply}…`}
                className="flex-1 text-sm rounded-lg px-3 py-1.5 outline-none"
                style={{
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text-primary)',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && commentText.trim()) {
                    setCommentText('')
                  }
                }}
              />
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
