'use client'
import { useState, useEffect } from 'react'
import { Trophy, Medal } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { getDict } from '@/lib/i18n'
import type { LeaderboardEntry } from '@/types'

const MEDAL_STYLE: Record<number, { bg: string; text: string }> = {
  1: { bg: '#FFD700', text: '#7a5c00' },
  2: { bg: '#C0C0C0', text: '#4a4a4a' },
  3: { bg: '#CD7F32', text: '#5a2e00' },
}

function Avatar({ name, url }: { name: string; url?: string }) {
  if (url) return <img src={url} alt={name} className="w-12 h-12 rounded-full object-cover" />
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
      style={{ background: 'var(--brand-primary)' }}
    >
      {name[0]?.toUpperCase()}
    </div>
  )
}

export default function RankingsPage() {
  const lang = useAppStore((s) => s.lang)
  const dict = getDict(lang)
  const r = dict.rankings

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/rankings')
      .then((res) => res.json())
      .then((data) => { if (data.leaderboard) setLeaderboard(data.leaderboard) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Cargando…</span>
      </div>
    )
  }

  const top3 = leaderboard.slice(0, 3)
  const rest  = leaderboard.slice(3)

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-6">
        <Trophy size={22} style={{ color: 'var(--brand-accent)' }} />
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{r.title}</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.this_week}</p>
        </div>
      </div>

      {leaderboard.length === 0 && (
        <p className="text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>
          Aún no hay usuarios con reputación. ¡Interactúa en el feed!
        </p>
      )}

      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {top3.map((e) => {
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
                <Avatar name={e.user.name} url={e.user.avatarUrl} />
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
      )}

      {rest.length > 0 && (
        <div className="flex flex-col gap-2 mb-6">
          {rest.map((e) => (
            <div
              key={e.user.id}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)' }}
            >
              <span className="text-sm font-bold w-5 text-right flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                {e.rank}
              </span>
              <Avatar name={e.user.name} url={e.user.avatarUrl} />
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
      )}

      <div
        className="rounded-xl p-4"
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
