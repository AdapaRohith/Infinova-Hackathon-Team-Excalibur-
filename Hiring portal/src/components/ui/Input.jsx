import { cn } from '../../utils/helpers'

export function Input({ className, label, ...props }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-gray-300">
      {label ? <span>{label}</span> : null}
      <input
        className={cn(
          'rounded-2xl border border-gray-800 bg-gray-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30',
          className,
        )}
        {...props}
      />
    </label>
  )
}
