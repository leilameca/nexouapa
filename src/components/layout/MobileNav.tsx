'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Home, Users, MessageCircle, Bell, Settings } from 'lucide-react'

const mobileNav = [
  { href: '/feed',           Icon: Home },
  { href: '/grupos',         Icon: Users },
  { href: '/mensajes',       Icon: MessageCircle },
  { href: '/notificaciones', Icon: Bell },
  { href: '/settings',       Icon: Settings },
]

export default function MobileNav() {
  const pathname = usePathname()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const load = () =>
      fetch('/api/notifications')
        .then((r) => r.ok ? r.json() : null)
        .then((d) => d && setUnread(d.unreadCount ?? 0))
    load()
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex md:hidden border-t"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', zIndex: 50 }}
    >
      {mobileNav.map(({ href, Icon }) => {
        const active = pathname.startsWith(href)
        const isBell = href === '/notificaciones'
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex items-center justify-center py-3 transition-colors"
            style={{ color: active ? 'var(--brand-primary)' : 'var(--text-muted)' }}
          >
            <span className="relative">
              <Icon size={22} strokeWidth={active ? 2.3 : 1.7} />
              {isBell && unread > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white px-0.5"
                  style={{ background: '#ef4444' }}
                >
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
