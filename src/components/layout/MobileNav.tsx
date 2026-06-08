'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Presentation, Timer, BookOpen, Trophy, Settings } from 'lucide-react'

const mobileNav = [
  { href: '/feed',     Icon: Home },
  { href: '/vitrina',  Icon: Presentation },
  { href: '/pomodoro', Icon: Timer },
  { href: '/apuntes',  Icon: BookOpen },
  { href: '/rankings', Icon: Trophy },
  { href: '/settings', Icon: Settings },
]

export default function MobileNav() {
  const pathname = usePathname()
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex md:hidden border-t"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', zIndex: 50 }}
    >
      {mobileNav.map(({ href, Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex items-center justify-center py-3 transition-colors"
            style={{ color: active ? 'var(--brand-primary)' : 'var(--text-muted)' }}
          >
            <Icon size={20} strokeWidth={active ? 2.3 : 1.7} />
          </Link>
        )
      })}
    </nav>
  )
}
