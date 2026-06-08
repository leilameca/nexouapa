'use client'
import { useState, useEffect, useRef } from 'react'
import { BookOpen, Plus, Search, FileText, X, Save, Trash2, Globe, Lock, Loader, ArrowLeft } from 'lucide-react'
import { NoteSkeleton } from '@/components/ui/Skeleton'
import { useAppStore } from '@/stores/appStore'
import { getDict } from '@/lib/i18n'

interface Note {
  id: string
  title: string
  subject: string
  content: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ApuntesPage() {
  const lang = useAppStore((s) => s.lang)
  const dict = getDict(lang)

  const [notes, setNotes]         = useState<Note[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [view, setView]           = useState<'list' | 'read' | 'edit' | 'new'>('list')
  const [selected, setSelected]   = useState<Note | null>(null)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState(false)

  const [form, setForm] = useState({ title: '', subject: '', content: '', isPublic: false })
  const contentRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetch('/api/notes')
      .then((r) => r.json())
      .then((data) => { if (data.notes) setNotes(data.notes) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = search.trim()
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.subject.toLowerCase().includes(search.toLowerCase()) ||
          n.content.toLowerCase().includes(search.toLowerCase())
      )
    : notes

  function openNew() {
    setForm({ title: '', subject: '', content: '', isPublic: false })
    setSelected(null)
    setView('new')
    setTimeout(() => contentRef.current?.focus(), 100)
  }

  function openEdit(note: Note) {
    setForm({ title: note.title, subject: note.subject, content: note.content, isPublic: note.isPublic })
    setSelected(note)
    setView('edit')
  }

  async function saveNote() {
    if (!form.title.trim() || !form.content.trim() || !form.subject.trim()) return
    setSaving(true)

    if (view === 'new') {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const { note } = await res.json()
        setNotes((prev) => [note, ...prev])
        setSelected(note)
        setView('read')
      }
    } else if (view === 'edit' && selected) {
      const res = await fetch(`/api/notes/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const { note } = await res.json()
        setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)))
        setSelected(note)
        setView('read')
      }
    }
    setSaving(false)
  }

  async function deleteNote(note: Note) {
    setDeleting(true)
    const res = await fetch(`/api/notes/${note.id}`, { method: 'DELETE' })
    if (res.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== note.id))
      setView('list')
      setSelected(null)
    }
    setDeleting(false)
  }

  // READ VIEW
  if (view === 'read' && selected) {
    return (
      <div style={{ background: 'var(--bg)' }}>
        <div
          className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
        >
          <button onClick={() => setView('list')} style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              {selected.title}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)' }}
              >
                {selected.subject}
              </span>
              <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                {selected.isPublic ? <Globe size={10} /> : <Lock size={10} />}
                {selected.isPublic ? 'Público' : 'Privado'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openEdit(selected)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              Editar
            </button>
            <button
              onClick={() => deleteNote(selected)}
              disabled={deleting}
              className="p-1.5 rounded-lg"
              style={{ color: '#ef4444' }}
            >
              {deleting ? <Loader size={15} className="animate-spin" /> : <Trash2 size={15} />}
            </button>
          </div>
        </div>
        <div className="p-6">
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            Actualizado {fmtDate(selected.updatedAt)}
          </p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
            {selected.content}
          </p>
        </div>
      </div>
    )
  }

  // NEW / EDIT VIEW
  if (view === 'new' || view === 'edit') {
    return (
      <div className="flex flex-col h-screen" style={{ background: 'var(--bg)' }}>
        <div
          className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
        >
          <button onClick={() => setView(selected ? 'read' : 'list')} style={{ color: 'var(--text-secondary)' }}>
            <X size={18} />
          </button>
          <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {view === 'new' ? 'Nuevo apunte' : 'Editar apunte'}
          </span>
          <button
            onClick={saveNote}
            disabled={saving || !form.title.trim() || !form.content.trim() || !form.subject.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: 'var(--brand-primary)' }}
          >
            {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
            Guardar
          </button>
        </div>

        <div className="flex flex-col gap-0 flex-1 overflow-y-auto">
          {/* Title */}
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Título del apunte"
            className="w-full px-5 pt-5 pb-2 text-lg font-bold outline-none bg-transparent"
            style={{ color: 'var(--text-primary)' }}
          />

          {/* Subject + visibility row */}
          <div className="flex items-center gap-3 px-5 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Asignatura (ej. Cálculo II)"
              className="flex-1 text-sm outline-none bg-transparent"
              style={{ color: 'var(--text-secondary)' }}
            />
            <button
              type="button"
              onClick={() => setForm({ ...form, isPublic: !form.isPublic })}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors"
              style={{
                borderColor: form.isPublic ? 'var(--brand-primary)' : 'var(--border)',
                color: form.isPublic ? 'var(--brand-primary)' : 'var(--text-muted)',
                background: form.isPublic ? 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' : 'transparent',
              }}
            >
              {form.isPublic ? <Globe size={11} /> : <Lock size={11} />}
              {form.isPublic ? 'Público' : 'Privado'}
            </button>
          </div>

          {/* Content */}
          <textarea
            ref={contentRef}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Escribe tus apuntes aquí..."
            className="flex-1 w-full px-5 py-4 text-sm outline-none bg-transparent resize-none leading-relaxed"
            style={{ color: 'var(--text-primary)', minHeight: '300px' }}
          />
        </div>
      </div>
    )
  }

  // LIST VIEW
  return (
    <div>
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
      >
        <div className="flex items-center gap-2">
          <BookOpen size={18} style={{ color: 'var(--brand-primary)' }} />
          <h1 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            {dict.nav.notes}
          </h1>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}>
            {notes.length}
          </span>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white"
          style={{ background: 'var(--brand-primary)' }}
        >
          <Plus size={14} />
          Nuevo
        </button>
      </div>

      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ border: '1px solid var(--border)', background: 'var(--bg)' }}
        >
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar apuntes..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ color: 'var(--text-muted)' }}>
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="p-4 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => <NoteSkeleton key={i} />)}
        </div>
      )}

      {!loading && notes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <FileText size={36} style={{ color: 'var(--text-muted)' }} />
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Sin apuntes aún</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Crea tu primer apunte para organizar tus notas de clase
            </p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: 'var(--brand-primary)' }}
          >
            <Plus size={14} />
            Crear apunte
          </button>
        </div>
      )}

      {!loading && filtered.length === 0 && notes.length > 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No hay resultados para "{search}"</p>
        </div>
      )}

      <div>
        {filtered.map((note) => (
          <button
            key={note.id}
            onClick={() => { setSelected(note); setView('read') }}
            className="w-full p-4 border-b text-left transition-colors"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                  {note.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)' }}
                  >
                    {note.subject}
                  </span>
                  {note.isPublic && (
                    <span className="text-xs flex items-center gap-0.5" style={{ color: 'var(--text-muted)' }}>
                      <Globe size={10} /> Público
                    </span>
                  )}
                </div>
                <p className="text-xs mt-1.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                  {note.content}
                </p>
              </div>
              <span className="text-xs shrink-0 pt-0.5" style={{ color: 'var(--text-muted)' }}>
                {fmtDate(note.updatedAt)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
