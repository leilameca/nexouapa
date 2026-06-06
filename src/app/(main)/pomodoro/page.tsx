'use client'
import { useState } from 'react'
import { Plus, Users, Lock, Send } from 'lucide-react'
import PomodoroTimer from '@/components/pomodoro/PomodoroTimer'
import { useAppStore } from '@/stores/appStore'
import { getDict } from '@/lib/i18n'
import type { PomodoroRoom } from '@/types'

const MOCK_ROOMS: PomodoroRoom[] = [
  {
    id: '1', name: 'Ingeniería de Software', school: 'Ingeniería y Tecnología',
    timerSeconds: 1500, isBreak: false, cycleStart: new Date().toISOString(), participantCount: 12,
  },
  {
    id: '2', name: 'Cálculo I', school: 'Ingeniería y Tecnología',
    timerSeconds: 300, isBreak: true, cycleStart: new Date().toISOString(), participantCount: 5,
  },
  {
    id: '3', name: 'Psicología Clínica', school: 'Ciencias de la Salud',
    timerSeconds: 1500, isBreak: false, cycleStart: new Date().toISOString(), participantCount: 3,
  },
]

interface ChatMsg { id: string; author: string; text: string }

export default function PomodoroPage() {
  const lang = useAppStore((s) => s.lang)
  const dict = getDict(lang)
  const p = dict.pomodoro

  const [rooms] = useState<PomodoroRoom[]>(MOCK_ROOMS)
  const [activeRoom, setActiveRoom] = useState<PomodoroRoom | null>(null)
  const [isBreak, setIsBreak] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [chatInput, setChatInput] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')

  function joinRoom(room: PomodoroRoom) {
    setActiveRoom(room)
    setIsBreak(room.isBreak)
  }

  function sendMessage() {
    if (!chatInput.trim() || !isBreak) return
    setMessages((m) => [...m, { id: Date.now().toString(), author: 'Tú', text: chatInput }])
    setChatInput('')
  }

  function handleCycleEnd() {
    setIsBreak((b) => !b)
  }

  if (activeRoom) {
    return (
      <div className="flex flex-col h-screen" style={{ background: 'var(--bg)' }}>
        {/* Room header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
        >
          <div>
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{activeRoom.name}</h2>
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Users size={12} />
              {activeRoom.participantCount} {p.participants}
            </div>
          </div>
          <button
            onClick={() => setActiveRoom(null)}
            className="text-xs px-3 py-1.5 rounded-lg border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            {p.leave}
          </button>
        </div>

        {/* Timer */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
          <PomodoroTimer
            totalSeconds={isBreak ? 300 : 1500}
            isBreak={isBreak}
            onCycleEnd={handleCycleEnd}
          />

          {/* Chat */}
          <div className="w-full max-w-sm">
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)' }}
            >
              <div className="p-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
                {!isBreak && <Lock size={12} style={{ color: 'var(--text-muted)' }} />}
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Chat {!isBreak && `· ${p.chat_locked}`}
                </span>
              </div>

              <div className="h-40 overflow-y-auto p-3 flex flex-col gap-2">
                {messages.length === 0 && (
                  <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                    {isBreak ? p.chat_placeholder : p.chat_locked}
                  </p>
                )}
                {messages.map((m) => (
                  <div key={m.id}>
                    <span className="text-xs font-semibold" style={{ color: 'var(--brand-primary)' }}>
                      {m.author}:{' '}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{m.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex border-t" style={{ borderColor: 'var(--border)' }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={!isBreak}
                  placeholder={isBreak ? p.chat_placeholder : p.chat_locked}
                  className="flex-1 px-3 py-2 text-xs outline-none bg-transparent"
                  style={{ color: 'var(--text-primary)' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!isBreak || !chatInput.trim()}
                  className="px-3 disabled:opacity-30"
                  style={{ color: 'var(--brand-primary)' }}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {p.rooms}
        </h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: 'var(--brand-primary)' }}
        >
          <Plus size={15} />
          {p.create_room}
        </button>
      </div>

      {showCreate && (
        <div
          className="rounded-xl p-4 mb-4"
          style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)' }}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder={p.room_name}
              className="flex-1 text-sm rounded-lg px-3 py-2 outline-none"
              style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
            />
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: 'var(--brand-primary)' }}
            >
              {p.create_room}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="rounded-xl p-4"
            style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>{room.name}</h3>
                {room.school && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{room.school}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <Users size={11} /> {room.participantCount} {p.participants}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: room.isBreak
                        ? 'color-mix(in srgb, var(--brand-accent) 15%, transparent)'
                        : 'color-mix(in srgb, #22c55e 15%, transparent)',
                      color: room.isBreak ? 'var(--brand-accent)' : '#16a34a',
                    }}
                  >
                    {room.isBreak ? p.break : p.focus}
                  </span>
                </div>
              </div>
              <button
                onClick={() => joinRoom(room)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white flex-shrink-0"
                style={{ background: 'var(--brand-primary)' }}
              >
                {p.join}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
