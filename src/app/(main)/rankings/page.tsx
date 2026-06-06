'use client'
import { Trophy, Medal } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { getDict } from '@/lib/i18n'
import type { LeaderboardEntry } from '@/types'

const MOCK: LeaderboardEntry[] = [
  { rank: 1, user: { id: 'u1', name: 'María Torres',    avatarUrl: undefined, school: 'Ing. y Tecnología', career: 'Ing. de Software' }, reputationPoints: 1380 },
  { rank: 2, user: { id: 'u2', name: 'Julio Díaz',      avatarUrl: undefined, school: 'Ciencias de la Salud', career: 'Psicología' },    reputationPoints: 1095 },
  { rank: 3, user: { id: 'u3', name: 'Ana Vargas',      avatarUrl: undefined, school: 'Económicas', career: 'Contabilidad' },            reputationPoints: 920 },
  { rank: 4, user: { id: 'u4', name: 'Pedro Santos',    avatarUrl: undefined, school: 'Ing. y Tecnología', career: 'Sistemas' },         reputationPoints: 710 },
  { rank: 5, user: { id: 'u5', name: 'Carla Méndez',    avatarUrl: undefined, school: 'Humanidades', career: 'Comunicación' },           reputationPoints: 580 },
  { rank: 6, user: { id: 'u6', name: 'Roberto García',  avatarUrl: undefined, school: 'Jurídicas', career: 'Derecho' },                  reputationPoints: 430 },
  { rank: 7, user: { id: 'u7', name: 'Laura Reyes',     avatarUrl: undefined, school: 'Educación', career: 'Ed. Básica' },               reputationPoints: 320 },
  { rank: 8, user: { id: 'u8', name: 'Miguel Ruiz',     avatarUrl: undefined, school: 'Ing. y Tecnología', career: 'Ing. Civil' },       reputationPoints: 210 },
]

const MEDAL_STYLE: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: '#FFD700', text: '#7a5c00', label: 'Oro' },
  2: { bg: '#C0C0C0', text: '#4a4a4a', label: 'Plata' },
  3: { bg: '#CD7F32', text: '#5a2e00', label: 'Bronce' },
}

export default function RankingsPage() {
  const lang = useAppStore((s) => s.lang)
  const dict = getDict(lang)
  const r = dict.rankings

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-6">
        <Trophy size={22} style={{ color: 'var(--brand-accent)' }} />
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{r.title}</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.this_week}</p>
        </div>
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {MOCK.slice(0, 3).map((e) => {
          const medal = MEDAL_STYLE[e.rank]
          return (
            <div
              key={e.user.id}
              className="rounded-xl p-4 flex flex-col items-center gap-2 text-center"
              style={{ border: `2px solid ${medal.bg}`, background: 'var(--bg-surface)' }}
            >
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: medal.bg, color: medal.text }}
              >
                #{e.rank}
              </span>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
                style={{ background: 'var(--brand-primary)' }}
              >
                {e.user.name[0]}
              </div>
              <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                {e.user.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{e.user.career}</p>
              <p className="text-sm font-bold" style={{ color: 'var(--brand-accent)' }}>
                {e.reputationPoints} {r.reputation}
              </p>
            </div>
          )
        })}
      </div>

      {/* Full list */}
      <div className="flex flex-col gap-2">
        {MOCK.slice(3).map((e) => (
          <div
            key={e.user.id}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)' }}
          >
            <span className="text-sm font-bold w-5 text-right flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
              {e.rank}
            </span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: 'var(--brand-primary)' }}
            >
              {e.user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{e.user.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{e.user.career}</p>
            </div>
            <span className="text-sm font-semibold flex-shrink-0" style={{ color: 'var(--brand-accent)' }}>
              {e.reputationPoints} {r.reputation}
            </span>
          </div>
        ))}
      </div>

      {/* Scoring legend */}
      <div
        className="mt-6 rounded-xl p-4"
        style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Medal size={14} style={{ color: 'var(--brand-primary)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Sistema de puntuación
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          {[
            ['Upvote recibido en proyecto o pregunta', '+10 pts'],
            ['Respuesta marcada como útil', '+15 pts'],
            ['Like en publicación general', '+2 pts'],
          ].map(([desc, pts]) => (
            <div key={desc} className="flex justify-between">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--brand-accent)' }}>{pts}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
