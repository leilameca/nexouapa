'use client'
import { create } from 'zustand'
import type { Lang, Theme } from '@/types'

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1]
}

interface AppState {
  theme: Theme
  lang: Lang
  setTheme: (t: Theme) => void
  setLang: (l: Lang) => void
}

export const useAppStore = create<AppState>((set) => ({
  theme: (getCookie('nexo-theme') as Theme) ?? 'light',
  lang:  (getCookie('nexo-lang')  as Lang)  ?? 'es',
  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme)
    document.cookie = `nexo-theme=${theme};path=/;max-age=31536000`
    set({ theme })
  },
  setLang: (lang) => {
    document.cookie = `nexo-lang=${lang};path=/;max-age=31536000`
    set({ lang })
  },
}))
