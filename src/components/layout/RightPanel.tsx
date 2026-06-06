'use client'
import { Timer, TrendingUp, Medal } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { getDict } from '@/lib/i18n'

const MOCK_ROOMS = [
  { id: '1', name: 'Ingeniería de Software', participants: 12, isBreak: false, secsLeft: 847 },
  { id: '2', name: 'Cálculo I', participants: 5, isBreak: true, secsLeft: 183 },
]

const MOCK_TRENDS = ['#ProgramaciónWeb', '#BasesDeDatos', '#CálculoI', '#MatemáticasDiscreta']

const MOCK_TOP = [
  { rank: 1, name: 'María Torres', pts: 380, career: 'Ing. Software' },
  { rank: 2, name: 'Julio Díaz',   pts: 295, career: 'Psicología' },
  { rank: 3, name: 'Ana Vargas',   pts: 210, career: 'Contabilidad' },
]

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']

function fmtTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function RightPanel() {
  const lang = useAppStore((s) => s.lang)
  const dict = getDict(lang)

  return (
    <aside
      className="hidden xl:flex flex-col sticky top-0 h-screen overflow-y-auto py-6 px-4 gap-6 flex-shrink-0 w-72"
      style={{ borderLeft: '1px solid var(--border)', background: 'var(--bg-surface)' }}
    >
      {/* Active Pomodoro Rooms */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Timer size={15} style={{ color: 'var(--brand-accent)' }} />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            {dict.pomodoro.rooms}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {MOCK_ROOMS.map((r) => (
            <div
              key={r.id}
              className="rounded-lg p-3"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {r.name}
                </span>
                <span
                  className="text-xs font-mono font-bold"
                  style={{ color: r.isBreak ? 'var(--brand-accent)' : 'var(--brand-primary)' }}
                >
                  {fmtTime(r.secsLeft)}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: r.isBreak ? 'var(--brand-accent)' : '#22c55e' }}
                />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {r.participants} {dict.pomodoro.participants} · {r.isBreak ? dict.pomodoro.break : dict.pomodoro.focus}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending hashtags */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={15} style={{ color: 'var(--brand-primary)' }} />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Tendencias
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          {MOCK_TRENDS.map((tag) => (
            <span
              key={tag}
              className="text-sm cursor-pointer hover:underline"
              style={{ color: 'var(--brand-primary)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* Top contributors */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Medal size={15} style={{ color: 'var(--brand-accent)' }} />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            {dict.rankings.title} · {dict.rankings.this_week}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {MOCK_TOP.map((entry) => (
            <div key={entry.rank} className="flex items-center gap-3">
              <div className="relative w-7 h-7 flex-shrink-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'var(--brand-primary)' }}
                >
                  {entry.name[0]}
                </div>
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                  style={{ background: MEDAL_COLORS[entry.rank - 1], borderColor: 'var(--bg-surface)' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {entry.name}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {entry.career}
                </p>
              </div>
              <span className="text-xs font-semibold flex-shrink-0" style={{ color: 'var(--brand-accent)' }}>
                {entry.pts} {dict.rankings.reputation}
              </span>
            </div>
          ))}
        </div>
      </section>
    </aside>
  )
}
