'use client'
import { useState } from 'react'
import { FileText, HelpCircle, Layers, Image, Link, Send } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { getDict } from '@/lib/i18n'
import type { PostType } from '@/types'

const TYPES: { type: PostType; icon: typeof FileText; labelKey: string }[] = [
  { type: 'general',  icon: FileText,    labelKey: 'feed.post_general' },
  { type: 'question', icon: HelpCircle,  labelKey: 'feed.post_question' },
  { type: 'project',  icon: Layers,      labelKey: 'feed.post_project' },
]

interface Props {
  onPublish?: (post: {
    postType: PostType
    content: string
    subjectTag?: string
    projectTitle?: string
    projectUrl?: string
  }) => void
}

export default function PostComposer({ onPublish }: Props) {
  const lang = useAppStore((s) => s.lang)
  const dict = getDict(lang)
  const f = dict.feed

  const [type, setType] = useState<PostType>('general')
  const [content, setContent] = useState('')
  const [subject, setSubject] = useState('')
  const [projectTitle, setProjectTitle] = useState('')
  const [projectUrl, setProjectUrl] = useState('')

  function handlePublish() {
    if (!content.trim()) return
    onPublish?.({ postType: type, content, subjectTag: subject, projectTitle, projectUrl })
    setContent('')
    setSubject('')
    setProjectTitle('')
    setProjectUrl('')
  }

  return (
    <div
      className="p-4 border-b"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
    >
      {/* Type tabs */}
      <div className="flex gap-1 mb-3">
        {TYPES.map(({ type: t, icon: Icon, labelKey }) => {
          const [ns, k] = labelKey.split('.')
          const label = (dict as Record<string, Record<string, string>>)[ns]?.[k] ?? k
          const active = type === t
          return (
            <button
              key={t}
              onClick={() => setType(t)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
              style={{
                borderColor: active ? 'var(--brand-primary)' : 'var(--border)',
                background: active ? 'color-mix(in srgb, var(--brand-primary) 12%, transparent)' : 'transparent',
                color: active ? 'var(--brand-primary)' : 'var(--text-muted)',
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          )
        })}
      </div>

      {/* Main text */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={f.placeholder}
        rows={3}
        className="w-full resize-none text-sm outline-none bg-transparent"
        style={{ color: 'var(--text-primary)' }}
      />

      {/* Extra fields for question */}
      {type === 'question' && (
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={f.subject_placeholder}
          className="mt-2 w-full text-sm rounded-lg px-3 py-2 outline-none"
          style={{
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--text-primary)',
          }}
        />
      )}

      {/* Extra fields for project */}
      {type === 'project' && (
        <div className="mt-2 flex flex-col gap-2">
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder={f.project_title}
            className="w-full text-sm rounded-lg px-3 py-2 outline-none"
            style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
          />
          <div className="flex items-center gap-2">
            <Link size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              type="url"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              placeholder={f.project_url}
              className="flex-1 text-sm rounded-lg px-3 py-2 outline-none"
              style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
            />
          </div>
          <button
            type="button"
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border self-start"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            <Image size={13} />
            {f.project_image}
          </button>
        </div>
      )}

      {/* Publish bar */}
      <div className="flex justify-end mt-3">
        <button
          onClick={handlePublish}
          disabled={!content.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ background: 'var(--brand-primary)' }}
        >
          <Send size={14} />
          {f.publish}
        </button>
      </div>
    </div>
  )
}
