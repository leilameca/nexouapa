'use client'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/stores/appStore'
import { getDict } from '@/lib/i18n'

interface Props {
  totalSeconds: number
  isBreak: boolean
  onCycleEnd?: () => void
}

export default function PomodoroTimer({ totalSeconds, isBreak, onCycleEnd }: Props) {
  const lang = useAppStore((s) => s.lang)
  const dict = getDict(lang)
  const [secs, setSecs] = useState(totalSeconds)

  useEffect(() => {
    setSecs(totalSeconds)
  }, [totalSeconds, isBreak])

  useEffect(() => {
    if (secs <= 0) { onCycleEnd?.(); return }
    const id = setTimeout(() => setSecs((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [secs, onCycleEnd])

  const minutes = Math.floor(secs / 60).toString().padStart(2, '0')
  const seconds = (secs % 60).toString().padStart(2, '0')
  const progress = ((totalSeconds - secs) / totalSeconds) * 100

  const color = isBreak ? 'var(--brand-accent)' : 'var(--brand-primary)'
  const r = 56
  const circ = 2 * Math.PI * r

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color }}>
        {isBreak ? dict.pomodoro.break : dict.pomodoro.focus}
      </p>
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
          <circle
            cx="64" cy="64" r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ - (circ * progress) / 100}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
            {minutes}:{seconds}
          </span>
        </div>
      </div>
    </div>
  )
}
