'use client'
import { useState, useRef } from 'react'
import { FileText, HelpCircle, Layers, ImageIcon, Link, Send, X, Loader } from 'lucide-react'
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
    thumbnailUrl?: string
  }) => void
}

export default function PostComposer({ onPublish }: Props) {
  const lang = useAppStore((s) => s.lang)
  const dict = getDict(lang)
  const f = dict.feed

  const [type, setType]             = useState<PostType>('general')
  const [content, setContent]       = useState('')
  const [subject, setSubject]       = useState('')
  const [projectTitle, setProjectTitle] = useState('')
  const [projectUrl, setProjectUrl]   = useState('')
  const [imageUrl, setImageUrl]       = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (res.ok) {
      const { url } = await res.json()
      setImageUrl(url)
    }
    setUploadingImage(false)
    e.target.value = ''
  }

  function handlePublish() {
    if (!content.trim()) return
    onPublish?.({
      postType: type,
      content,
      subjectTag:   subject      || undefined,
      projectTitle: projectTitle || undefined,
      projectUrl:   projectUrl   || undefined,
      thumbnailUrl: imageUrl     || undefined,
    })
    setContent('')
    setSubject('')
    setProjectTitle('')
    setProjectUrl('')
    setImageUrl(null)
  }

  return (
    <div
      className="p-4 border-b"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
    >
      {/* Type tabs — wrap on small screens */}
      <div className="flex flex-wrap gap-1 mb-3">
        {TYPES.map(({ type: t, icon: Icon, labelKey }) => {
          const [ns, k] = labelKey.split('.')
          const label = (dict as Record<string, Record<string, string>>)[ns]?.[k] ?? k
          const active = type === t
          return (
            <button
              key={t}
              onClick={() => setType(t)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all"
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
          style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
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
        </div>
      )}

      {/* Image preview */}
      {imageUrl && (
        <div className="relative mt-2 inline-block">
          <img
            src={imageUrl}
            alt="Vista previa"
            className="rounded-xl max-h-48 object-cover"
          />
          <button
            onClick={() => setImageUrl(null)}
            className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          >
            <X size={12} className="text-white" />
          </button>
        </div>
      )}

      {/* Bottom bar */}
      <div className="flex items-center justify-between mt-3">
        {/* Image upload */}
        <div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploadingImage}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            title={f.project_image}
          >
            {uploadingImage ? <Loader size={13} className="animate-spin" /> : <ImageIcon size={13} />}
            <span className="hidden sm:inline">
              {uploadingImage ? 'Subiendo…' : 'Imagen'}
            </span>
          </button>
        </div>

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
