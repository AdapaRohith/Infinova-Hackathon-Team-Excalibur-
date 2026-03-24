import { cn } from '../../utils/helpers'

const variants = {
  primary:
    'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-xl shadow-indigo-500/25 hover:from-indigo-400 hover:to-violet-400 hover:brightness-110',
  secondary:
    'bg-gray-900 text-white ring-1 ring-gray-700 hover:bg-gray-800',
  ghost: 'bg-transparent text-gray-300 hover:bg-gray-900',
  success:
    'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30 hover:bg-emerald-500/30',
}

export function Button({ className, variant = 'primary', ...props }) {
  return (
    <button
      className={cn(
        'rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-300 active:scale-[0.97] hover:scale-[1.03] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
