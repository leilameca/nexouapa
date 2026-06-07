'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Presentation, Timer, BookOpen, Trophy, Settings, LogOut
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useAppStore } from '@/stores/appStore'
import { getDict } from '@/lib/i18n'

const navItems = [
  { key: 'nav.home',      href: '/feed',      Icon: Home },
  { key: 'nav.vitrina',   href: '/vitrina',   Icon: Presentation },
  { key: 'nav.pomodoro',  href: '/pomodoro',  Icon: Timer },
  { key: 'nav.notes',     href: '/apuntes',   Icon: BookOpen },
  { key: 'nav.rankings',  href: '/rankings',  Icon: Trophy },
  { key: 'nav.settings',  href: '/settings',  Icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const lang = useAppStore((s) => s.lang)
  const dict = getDict(lang)

  function label(key: string) {
    const [ns, k] = key.split('.')
    return (dict as Record<string, Record<string, string>>)[ns]?.[k] ?? k
  }

  return (
    <aside
      className="hidden md:flex flex-col justify-between sticky top-0 h-screen py-6 flex-shrink-0 md:w-16 xl:w-60 md:px-2 xl:px-4"
      style={{ borderRight: '1px solid var(--border)', background: 'var(--bg-surface)' }}
    >
      {/* Logo */}
      <div>
        <div className="flex items-center gap-2 mb-8 justify-center xl:justify-start px-1">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: 'var(--brand-primary)' }}
          >
            N
          </div>
          <span className="font-semibold text-base hidden xl:block" style={{ color: 'var(--text-primary)' }}>
            NEXO UAPA
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1">
          {navItems.map(({ key, href, Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                title={label(key)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors justify-center xl:justify-start"
                style={{
                  color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  background: active ? 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' : 'transparent',
                }}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                <span className="hidden xl:block">{label(key)}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom: logout */}
      <button
        title={label('nav.logout')}
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-colors justify-center xl:justify-start"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <LogOut size={20} strokeWidth={1.8} />
        <span className="hidden xl:block">{label('nav.logout')}</span>
      </button>
    </aside>
  )
}
