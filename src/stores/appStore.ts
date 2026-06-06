'use client'
import { create } from 'zustand'
import type { Lang, Theme } from '@/types'

interface AppState {
  theme: Theme
  lang: Lang
  setTheme: (t: Theme) => void
  setLang: (l: Lang) => void
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  lang: 'es',
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
