export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-neutral-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-neutral-200 rounded w-3/4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
          </div>
          <div className="h-3 bg-neutral-200 rounded w-1/2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-neutral-200 rounded-full w-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
            </div>
            <div className="h-6 bg-neutral-200 rounded-full w-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="h-5 bg-neutral-200 rounded w-1/4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  )
}
