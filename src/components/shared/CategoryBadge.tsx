interface CategoryBadgeProps {
  category: string
  variant?: 'primary' | 'dark' | 'neutral'
}

export function CategoryBadge({ category, variant = 'primary' }: CategoryBadgeProps) {
  const styles = {
    primary: 'bg-[#FACC15] text-[#0A0A0A]',
    dark: 'bg-[#1A1A1A] text-white',
    neutral: 'bg-neutral-100 text-neutral-600',
  }

  return (
    <span className={`${styles[variant]} rounded-full px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs font-bold`}>
      {category}
    </span>
  )
}
