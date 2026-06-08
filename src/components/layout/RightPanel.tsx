'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Timer, Medal } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { getDict } from '@/lib/i18n'
import type { PomodoroRoom, LeaderboardEntry } from '@/types'

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']

function fmtTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function elapsedSecs(cycleStart: string, total: number) {
  const elapsed = Math.floor((Date.now() - new Date(cycleStart).getTime()) / 1000)
  return Math.max(0, total - (elapsed % total))
}

export default function RightPanel() {
  const lang = useAppStore((s) => s.lang)
  const dict = getDict(lang)

  const [rooms, setRooms]           = useState<PomodoroRoom[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [tick, setTick]             = useState(0)

  useEffect(() => {
    function load() {
      fetch('/api/rooms').then((r) => r.json()).then((d) => setRooms(d.rooms ?? []))
      fetch('/api/rankings').then((r) => r.json()).then((d) => setLeaderboard(d.leaderboard ?? []))
    }
    load()
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [])

  // Tick every second for live countdown
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const top3 = leaderboard.slice(0, 3)

  return (
    <aside
      className="hidden xl:flex flex-col sticky top-0 h-screen overflow-y-auto py-6 px-4 gap-6 shrink-0 w-72"
      style={{ borderLeft: '1px solid var(--border)', background: 'var(--bg-surface)' }}
    >
      {/* Active Pomodoro Rooms */}
      {rooms.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Timer size={15} style={{ color: 'var(--brand-accent)' }} />
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              {dict.pomodoro.rooms}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {rooms.slice(0, 4).map((r) => {
              const total = r.isBreak ? 300 : 1500
              const secsLeft = elapsedSecs(r.cycleStart, total)
              return (
                <Link
                  key={r.id}
                  href="/pomodoro"
                  className="rounded-lg p-3 block transition-colors"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--brand-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium truncate flex-1 mr-2" style={{ color: 'var(--text-primary)' }}>
                      {r.name}
                    </span>
                    <span className="text-xs font-mono font-bold shrink-0" style={{ color: r.isBreak ? 'var(--brand-accent)' : 'var(--brand-primary)' }}>
                      {fmtTime(secsLeft)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: r.isBreak ? 'var(--brand-accent)' : '#22c55e' }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {r.participantCount} {dict.pomodoro.participants} · {r.isBreak ? dict.pomodoro.break : dict.pomodoro.focus}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Top contributors */}
      {top3.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Medal size={15} style={{ color: 'var(--brand-accent)' }} />
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              {dict.rankings.title}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {top3.map((entry, i) => (
              <Link
                key={entry.user.id}
                href={`/perfil/${entry.user.id}`}
                className="flex items-center gap-3 group"
              >
                <div className="relative w-8 h-8 shrink-0">
                  {entry.user.avatarUrl ? (
                    <img src={entry.user.avatarUrl} alt={entry.user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--brand-primary)' }}>
                      {entry.user.name[0]?.toUpperCase()}
                    </div>
                  )}
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold"
                    style={{ background: MEDAL_COLORS[i], borderColor: 'var(--bg-surface)', color: '#000' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:underline" style={{ color: 'var(--text-primary)' }}>
                    {entry.user.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{entry.user.career}</p>
                </div>
                <span className="text-xs font-semibold shrink-0" style={{ color: 'var(--brand-accent)' }}>
                  {entry.reputationPoints} {dict.rankings.reputation}
                </span>
              </Link>
            ))}
            <Link href="/rankings" className="text-xs font-medium hover:underline mt-1" style={{ color: 'var(--brand-primary)' }}>
              Ver ranking completo →
            </Link>
          </div>
        </section>
      )}

      {/* Empty state when DB is empty */}
      {rooms.length === 0 && top3.length === 0 && (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            Las salas y el ranking aparecerán aquí cuando haya actividad.
          </p>
          <Link
            href="/pomodoro"
            className="text-center text-xs font-medium px-4 py-2 rounded-lg"
            style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)' }}
          >
            Crear primera sala
          </Link>
        </div>
      )}
    </aside>
  )
}
