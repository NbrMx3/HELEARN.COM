import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-lg p-4 sm:p-6',
        // light theme
        'border border-white/70 bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl',
        // dark theme
        'dark:border-slate-800/60 dark:bg-slate-900/70 dark:shadow-none',
        'before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-blue-600 before:via-indigo-600 before:to-cyan-500',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
