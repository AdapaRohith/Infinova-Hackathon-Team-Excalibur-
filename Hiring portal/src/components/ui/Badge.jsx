import { cn } from '../../utils/helpers'

export function Badge({ className, children, success = false }) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-1 text-xs font-medium',
        success
          ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40'
          : 'bg-gray-800 text-gray-300 ring-1 ring-gray-700',
        className,
      )}
    >
      {children}
    </span>
  )
}
