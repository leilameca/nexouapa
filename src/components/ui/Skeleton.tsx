export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded animate-pulse ${className}`}
      style={{ background: 'var(--skeleton)' }}
    />
  )
}

export function PostSkeleton() {
  return (
    <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="flex gap-3">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-3.5 w-16 rounded" />
          </div>
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-4/5 rounded" />
          <Skeleton className="h-3 w-3/5 rounded" />
          <div className="flex gap-6 mt-3">
            <Skeleton className="h-3 w-10 rounded" />
            <Skeleton className="h-3 w-10 rounded" />
            <Skeleton className="h-3 w-10 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function NoteSkeleton() {
  return (
    <div className="p-4 rounded-xl border space-y-2" style={{ borderColor: 'var(--border)' }}>
      <Skeleton className="h-4 w-3/5 rounded" />
      <Skeleton className="h-3 w-2/5 rounded" />
      <Skeleton className="h-3 w-full rounded" />
      <Skeleton className="h-3 w-4/5 rounded" />
    </div>
  )
}

export function ConversationSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-28 rounded" />
        <Skeleton className="h-3 w-40 rounded" />
      </div>
    </div>
  )
}
