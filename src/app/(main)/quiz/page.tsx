'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { BrainCircuit, Plus, Users, BookOpen, Play, Trash2, X, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface QuizRoomItem {
  id: string
  name: string
  subject?: string | null
  isActive: boolean
  createdAt: string
  host: { id: string; name: string; avatarUrl?: string | null }
  _count: { members: number; questions: number }
}

export default function QuizPage() {
  const { data: session } = useSession()
  const [rooms, setRooms]     = useState<QuizRoomItem[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/quiz')
      .then((r) => r.json())
      .then((d) => setRooms(d.rooms ?? []))
      .finally(() => setLoading(false))
  }, [])

  async function createRoom() {
    if (!newName.trim() || submitting) return
    setSubmitting(true)
    const res = await fetch('/api/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), subject: newSubject.trim() || null }),
    })
    if (res.ok) {
      const data = await res.json()
      setRooms((prev) => [data.room, ...prev])
      setCreating(false)
      setNewName('')
      setNewSubject('')
    }
    setSubmitting(false)
  }

  async function deleteRoom(id: string) {
    if (!confirm('¿Eliminar esta sala?')) return
    const res = await fetch(`/api/quiz/${id}`, { method: 'DELETE' })
    if (res.ok) setRooms((prev) => prev.filter((r) => r.id !== id))
  }

  async function joinRoom(id: string) {
    await fetch(`/api/quiz/${id}/join`, { method: 'POST' })
  }

  return (
    <div>
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-4 flex items-center justify-between"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <BrainCircuit size={18} style={{ color: 'var(--brand-primary)' }} />
          <h1 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
            Salas de Quiz
          </h1>
        </div>
        {session?.user && (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white"
            style={{ background: 'var(--brand-primary)' }}
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Nueva sala</span>
          </button>
        )}
      </div>

      {/* Create form */}
      {creating && (
        <div
          className="mx-4 mt-4 rounded-xl p-4 space-y-3"
          style={{ border: '1px solid var(--border)', background: 'var(--bg)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Nueva sala de quiz
            </span>
            <button onClick={() => setCreating(false)}>
              <X size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
          <input
            type="text"
            placeholder="Nombre de la sala (ej. Repaso Álgebra)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={80}
            className="w-full text-sm px-3 py-2 rounded-lg outline-none"
            style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
          />
          <input
            type="text"
            placeholder="Asignatura (opcional)"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            maxLength={60}
            className="w-full text-sm px-3 py-2 rounded-lg outline-none"
            style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
          />
          <button
            onClick={createRoom}
            disabled={!newName.trim() || submitting}
            className="w-full py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: 'var(--brand-primary)' }}
          >
            {submitting ? 'Creando…' : 'Crear sala'}
          </button>
        </div>
      )}

      {/* Rooms list */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Cargando salas…</span>
        </div>
      )}

      {!loading && rooms.length === 0 && !creating && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <BrainCircuit size={40} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
          <p className="text-sm text-center px-6" style={{ color: 'var(--text-muted)' }}>
            No hay salas de quiz todavía.<br />Crea la primera para tu clase.
          </p>
          {session?.user && (
            <button
              onClick={() => setCreating(true)}
              className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: 'var(--brand-primary)' }}
            >
              <Plus size={14} />
              Crear sala
            </button>
          )}
        </div>
      )}

      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {rooms.map((room) => {
          const isHost = session?.user?.id === room.host.id
          return (
            <div
              key={room.id}
              className="flex items-center gap-3 px-4 py-4"
              style={{ borderColor: 'var(--border)' }}
            >
              {/* Color dot */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)' }}
              >
                <BrainCircuit size={18} style={{ color: 'var(--brand-primary)' }} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {room.name}
                </p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  {room.subject && (
                    <span className="flex items-center gap-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <BookOpen size={10} />
                      {room.subject}
                    </span>
                  )}
                  <span className="flex items-center gap-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <Users size={10} />
                    {room._count.members} participantes
                  </span>
                  <span className="flex items-center gap-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <Play size={10} />
                    {room._count.questions} preguntas
                  </span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  por {room.host.name}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isHost && (
                  <button
                    onClick={() => deleteRoom(room.id)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    title="Eliminar sala"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <Link
                  href={`/quiz/${room.id}`}
                  onClick={() => joinRoom(room.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white"
                  style={{ background: 'var(--brand-primary)' }}
                >
                  Entrar
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
