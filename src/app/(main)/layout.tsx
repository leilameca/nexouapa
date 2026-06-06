import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Sidebar from '@/components/layout/Sidebar'
import RightPanel from '@/components/layout/RightPanel'
import MobileNav from '@/components/layout/MobileNav'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen flex justify-center" style={{ background: 'var(--bg)' }}>
      <div className="flex w-full max-w-[1280px]">
        <Sidebar />

        <main
          className="flex-1 min-w-0 min-h-screen pb-16 md:pb-0"
          style={{
            maxWidth: '680px',
            borderLeft: '1px solid var(--border)',
            borderRight: '1px solid var(--border)',
          }}
        >
          {children}
        </main>

        <RightPanel />
      </div>

      <MobileNav />
    </div>
  )
}
