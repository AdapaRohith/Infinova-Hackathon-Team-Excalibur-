import { LoaderCircle } from 'lucide-react'

export function Loader({ label = 'Processing...' }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-300">
      <LoaderCircle className="size-4 animate-spin text-indigo-300" />
      <span>{label}</span>
    </div>
  )
}
