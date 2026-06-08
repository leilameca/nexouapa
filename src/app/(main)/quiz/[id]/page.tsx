'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  ArrowLeft, BrainCircuit, Plus, X, Trophy, Users, Check, BookOpen,
} from 'lucide-react'

interface Question {
  id: string
  question: string
  options: string   // JSON array
  correctIndex: number
  orderIndex: number
}

interface Member {
  id: string
  score: number
  user: { id: string; name: string; avatarUrl?: string | null; career: string }
}

interface Room {
  id: string
  name: string
  subject?: string | null
  isActive: boolean
  hostId: string
  host: { id: string; name: string; avatarUrl?: string | null }
  questions: Question[]
  members: Member[]
}

export default function QuizRoomPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Answer state: questionId → { chosen, isCorrect }
  const [answers, setAnswers] = useState<Record<string, { chosen: number; isCorrect: boolean }>>({})
  const [answering, setAnswering] = useState<string | null>(null)

  // Add question form
  const [showForm, setShowForm] = useState(false)
  const [qText, setQText]     = useState('')
  const [opts, setOpts]       = useState(['', '', '', ''])
  const [correct, setCorrect] = useState(0)
  const [addingQ, setAddingQ] = useState(false)

  const isHost = session?.user?.id === room?.hostId

  useEffect(() => {
    fetch(`/api/quiz/${id}`)
      .then(async (r) => {
        if (r.status === 404) { setNotFound(true); return }
        const data = await r.json()
        setRoom(data.room)
      })
      .finally(() => setLoading(false))
    // Join automatically
    fetch(`/api/quiz/${id}/join`, { method: 'POST' })
  }, [id])

  async function submitAnswer(questionId: string, chosenIndex: number) {
    if (answers[questionId] || answering) return
    setAnswering(questionId)
    const res = await fetch(`/api/quiz/${id}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, answerIndex: chosenIndex }),
    })
    if (res.ok) {
      const data = await res.json()
      setAnswers((prev) => ({
        ...prev,
        [questionId]: { chosen: chosenIndex, isCorrect: data.isCorrect },
      }))
      // Update member score optimistically
      if (data.isCorrect && session?.user?.id) {
        setRoom((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            members: prev.members.map((m) =>
              m.user.id === session.user!.id ? { ...m, score: m.score + 10 } : m,
            ),
          }
        })
      }
    }
    setAnswering(null)
  }

  async function addQuestion() {
    if (!qText.trim() || opts.some((o) => !o.trim()) || addingQ) return
    setAddingQ(true)
    const res = await fetch(`/api/quiz/${id}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: qText.trim(), options: opts, correctIndex: correct }),
    })
    if (res.ok) {
      const data = await res.json()
      setRoom((prev) => prev ? { ...prev, questions: [...prev.questions, data.question] } : prev)
      setShowForm(false)
      setQText('')
      setOpts(['', '', '', ''])
      setCorrect(0)
    }
    setAddingQ(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Cargando sala…</span>
      </div>
    )
  }

  if (notFound || !room) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Sala no encontrada</p>
        <Link href="/quiz" className="text-sm hover:underline" style={{ color: 'var(--brand-primary)' }}>
          Volver a salas
        </Link>
      </div>
    )
  }

  const parsedQuestions = room.questions.map((q) => ({
    ...q,
    parsedOptions: JSON.parse(q.options) as string[],
  }))

  return (
    <div>
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
      >
        <Link href="/quiz" className="p-1.5 rounded-full" style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
            {room.name}
          </p>
          {room.subject && (
            <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <BookOpen size={10} />
              {room.subject}
            </p>
          )}
        </div>
        {isHost && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white shrink-0"
            style={{ background: 'var(--brand-primary)' }}
          >
            <Plus size={13} />
            Pregunta
          </button>
        )}
      </div>

      <div className="flex gap-0">
        {/* Questions column */}
        <div className="flex-1 min-w-0">
          {/* Add question form */}
          {showForm && isHost && (
            <div className="m-4 rounded-xl p-4 space-y-3" style={{ border: '1px solid var(--border)', background: 'var(--bg)' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Nueva pregunta
                </span>
                <button onClick={() => setShowForm(false)}><X size={15} style={{ color: 'var(--text-muted)' }} /></button>
              </div>
              <textarea
                placeholder="¿Cuál es la pregunta?"
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                rows={2}
                className="w-full text-sm px-3 py-2 rounded-lg outline-none resize-none"
                style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              />
              <div className="grid grid-cols-2 gap-2">
                {opts.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button
                      onClick={() => setCorrect(i)}
                      className="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center"
                      style={{
                        borderColor: correct === i ? 'var(--brand-primary)' : 'var(--border)',
                        background:  correct === i ? 'var(--brand-primary)' : 'transparent',
                      }}
                    >
                      {correct === i && <Check size={10} style={{ color: '#fff' }} />}
                    </button>
                    <input
                      type="text"
                      placeholder={`Opción ${i + 1}`}
                      value={opt}
                      onChange={(e) => setOpts((prev) => prev.map((o, j) => j === i ? e.target.value : o))}
                      className="flex-1 text-xs px-2 py-1.5 rounded-lg outline-none"
                      style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Haz clic en el circulo para marcar la respuesta correcta
              </p>
              <button
                onClick={addQuestion}
                disabled={!qText.trim() || opts.some((o) => !o.trim()) || addingQ}
                className="w-full py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
                style={{ background: 'var(--brand-primary)' }}
              >
                {addingQ ? 'Agregando…' : 'Agregar pregunta'}
              </button>
            </div>
          )}

          {parsedQuestions.length === 0 && !showForm && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <BrainCircuit size={36} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
              <p className="text-sm text-center px-6" style={{ color: 'var(--text-muted)' }}>
                {isHost
                  ? 'Agrega preguntas para comenzar el quiz.'
                  : 'El anfitrión aún no ha agregado preguntas.'}
              </p>
            </div>
          )}

          {/* Questions */}
          <div className="p-4 space-y-5">
            {parsedQuestions.map((q, qi) => {
              const answered = answers[q.id]
              return (
                <div
                  key={q.id}
                  className="rounded-xl p-4 space-y-3"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg)' }}
                >
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                    Pregunta {qi + 1}
                  </p>
                  <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
                    {q.question}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {q.parsedOptions.map((opt, oi) => {
                      let bg = 'var(--bg-surface)'
                      let border = 'var(--border)'
                      let textColor = 'var(--text-primary)'

                      if (answered) {
                        if (oi === q.correctIndex) {
                          bg = 'rgba(34,197,94,0.12)'
                          border = '#22c55e'
                          textColor = '#16a34a'
                        } else if (oi === answered.chosen && !answered.isCorrect) {
                          bg = 'rgba(239,68,68,0.10)'
                          border = '#ef4444'
                          textColor = '#dc2626'
                        }
                      }

                      return (
                        <button
                          key={oi}
                          disabled={!!answered || answering === q.id}
                          onClick={() => submitAnswer(q.id, oi)}
                          className="text-left px-3 py-2.5 rounded-lg text-sm transition-all"
                          style={{ background: bg, border: `1px solid ${border}`, color: textColor }}
                        >
                          <span className="font-medium mr-2 text-xs" style={{ opacity: 0.6 }}>
                            {String.fromCharCode(65 + oi)}.
                          </span>
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                  {answered && (
                    <p className="text-xs font-semibold" style={{ color: answered.isCorrect ? '#16a34a' : '#dc2626' }}>
                      {answered.isCorrect ? '+10 pts — Correcto' : 'Incorrecto'}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Leaderboard sidebar (visible on md+) */}
        {room.members.length > 0 && (
          <aside
            className="hidden md:flex flex-col w-52 shrink-0 p-4 gap-3 sticky top-14 self-start"
            style={{ borderLeft: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <Trophy size={14} style={{ color: 'var(--brand-accent)' }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Puntajes
              </span>
            </div>
            {room.members.map((m, i) => (
              <div key={m.id} className="flex items-center gap-2">
                <span className="text-xs w-4 text-center font-bold" style={{ color: 'var(--text-muted)' }}>
                  {i + 1}
                </span>
                {m.user.avatarUrl ? (
                  <img src={m.user.avatarUrl} alt={m.user.name} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: 'var(--brand-primary)' }}
                  >
                    {m.user.name[0]?.toUpperCase()}
                  </div>
                )}
                <span className="flex-1 text-xs truncate" style={{ color: 'var(--text-primary)' }}>
                  {m.user.name}
                </span>
                <span className="text-xs font-bold" style={{ color: 'var(--brand-accent)' }}>
                  {m.score}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-1 mt-1 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <Users size={11} style={{ color: 'var(--text-muted)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {room.members.length} participantes
              </span>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
