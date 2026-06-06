'use client'
import { Layers } from 'lucide-react'
import PostCard from '@/components/feed/PostCard'
import type { Post } from '@/types'

const PROJECTS: Post[] = [
  {
    id: 'p1', userId: 'u1', postType: 'project',
    content: 'Sistema de gestión de inventarios con autenticación JWT, dashboard de métricas en tiempo real y exportación a Excel.',
    projectUrl: 'https://github.com/ejemplo/inventario',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    user: { id: 'u1', name: 'Mariana López', school: 'Ing. y Tecnología', career: 'Ing. de Software' },
    _count: { likes: 31, upvotes: 47, reposts: 9, comments: 12 },
    userInteractions: [],
  },
  {
    id: 'p2', userId: 'u2', postType: 'project',
    content: 'App móvil de seguimiento de hábitos académicos construida con React Native y Firebase. Incluye recordatorios por push notification.',
    projectUrl: 'https://github.com/ejemplo/habitos',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    user: { id: 'u2', name: 'Carlos Mejía', school: 'Ing. y Tecnología', career: 'Ing. de Software' },
    _count: { likes: 18, upvotes: 29, reposts: 4, comments: 6 },
    userInteractions: [],
  },
]

export default function VitrinaPage() {
  return (
    <div>
      <div
        className="flex items-center gap-2 p-4 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
      >
        <Layers size={18} style={{ color: 'var(--brand-primary)' }} />
        <h1 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Vitrina de Proyectos</h1>
      </div>
      {PROJECTS.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  )
}
