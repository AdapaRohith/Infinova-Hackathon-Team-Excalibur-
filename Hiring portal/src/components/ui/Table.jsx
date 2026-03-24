import { cn } from '../../utils/helpers'

export function Table({ children, className = '' }) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/60 shadow-xl', className)}>
      <table className="min-w-full divide-y divide-gray-800 text-left text-sm">{children}</table>
    </div>
  )
}

export function TableHead({ children }) {
  return <thead className="bg-gray-900/90 text-gray-400">{children}</thead>
}

export function TableBody({ children }) {
  return <tbody className="divide-y divide-gray-800/80 bg-gray-950/50 text-gray-200">{children}</tbody>
}
