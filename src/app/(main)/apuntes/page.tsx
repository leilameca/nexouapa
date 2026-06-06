'use client'
import { useState } from 'react'
import { BookOpen, Plus, Search, FileText } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { getDict } from '@/lib/i18n'

interface Note {
  id: string
  title: string
  subject: string
  date: string
  content: string
}

const SEED_NOTES: Note[] = [
  {
    id: '1',
    title: 'Algoritmos de ordenamiento — resumen',
    subject: 'Estructuras de Datos',
    date: '4 jun 2026',
    content: 'Bubble sort O(n²), Merge sort O(n log n), Quick sort O(n log n) promedio. Para listas casi ordenadas, Insertion sort es el más eficiente.',
  },
  {
    id: '2',
    title: 'Integrales por sustitución (método u)',
    subject: 'Cálculo II',
    date: '2 jun 2026',
    content: 'Identificar u = g(x), calcular du = g\'(x) dx, reescribir la integral en términos de u, integrar, sustituir de vuelta.',
  },
  {
    id: '3',
    title: 'Modelos entidad-relación',
    subject: 'Bases de Datos',
    date: '1 jun 2026',
    content: 'Entidades fuertes y débiles. Atributos: simples, compuestos, multivaluados, derivados. Cardinalidad: 1:1, 1:N, M:N.',
  },
]

export default function ApuntesPage() {
  const lang = useAppStore((s) => s.lang)
  const dict = getDict(lang)

  const [notes] = useState<Note[]>(SEED_NOTES)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Note | null>(null)

  const filtered = search.trim()
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.subject.toLowerCase().includes(search.toLowerCase())
      )
    : notes

  if (selected) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        {/* Note header */}
        <div
          className="sticky top-0 z-10 flex items-center gap-3 p-4 border-b"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
        >
          <button
            onClick={() => setSelected(null)}
            className="text-xs px-3 py-1.5 rounded-lg border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            ← Volver
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              {selected.title}
            </h2>
            <span
              className="text-xs px-2 py-0.5 rounded-full inline-block mt-0.5"
              style={{
                background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
                color: 'var(--brand-primary)',
              }}
            >
              {selected.subject}
            </span>
          </div>
          <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
            {selected.date}
          </span>
        </div>

        {/* Note content */}
        <div className="p-6">
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
            {selected.content}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between p-4 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
      >
        <div className="flex items-center gap-2">
          <BookOpen size={18} style={{ color: 'var(--brand-primary)' }} />
          <h1 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            {dict.nav.notes}
          </h1>
        </div>
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white"
          style={{ background: 'var(--brand-primary)' }}
        >
          <Plus size={14} />
          Nuevo
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
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
        </div>
      </div>

      {/* Notes list */}
      <div className="flex flex-col">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <FileText size={32} style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No hay apuntes que coincidan
            </p>
          </div>
        )}
        {filtered.map((note) => (
          <button
            key={note.id}
            onClick={() => setSelected(note)}
            className="p-4 border-b text-left transition-colors w-full"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {note.title}
                </p>
                <span
                  className="inline-block text-xs px-2 py-0.5 rounded-full mt-1"
                  style={{
                    background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
                    color: 'var(--brand-primary)',
                  }}
                >
                  {note.subject}
                </span>
                <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                  {note.content}
                </p>
              </div>
              <span className="text-xs flex-shrink-0 pt-0.5" style={{ color: 'var(--text-muted)' }}>
                {note.date}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
