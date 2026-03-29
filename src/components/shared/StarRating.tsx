'use client'

interface StarRatingProps {
  rating: number
  maxStars?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  count?: number
}

export function StarRating({
  rating,
  maxStars = 5,
  size = 'md',
  showValue = false,
  count,
}: StarRatingProps) {
  const sizeMap = { sm: 12, md: 18, lg: 24 }
  const s = sizeMap[size]

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxStars }).map((_, i) => {
        const filled = i < Math.floor(rating)
        const half = !filled && i < rating

        return (
          <svg
            key={i}
            width={s}
            height={s}
            viewBox="0 0 24 24"
            fill={filled ? '#FACC15' : half ? 'url(#half)' : '#E5E5E5'}
            className="flex-shrink-0"
          >
            {half && (
              <defs>
                <linearGradient id="half">
                  <stop offset="50%" stopColor="#FACC15" />
                  <stop offset="50%" stopColor="#E5E5E5" />
                </linearGradient>
              </defs>
            )}
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        )
      })}
      {showValue && (
        <span className={`font-semibold text-neutral-700 ml-0.5 ${size === 'sm' ? 'text-xs md:text-sm' : 'text-sm'}`}>
          {rating.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className={`text-neutral-400 ml-0.5 ${size === 'sm' ? 'text-[10px] md:text-sm' : 'text-sm'}`}>({count})</span>
      )}
    </div>
  )
}
