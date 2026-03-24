import { CheckCircle2, CircleDotDashed } from 'lucide-react'

export function Timeline({ candidate }) {
  const steps = [
    {
      label: 'AI Analysis Completed',
      done: Boolean(candidate?.analysis),
      timestamp: candidate?.createdAt,
    },
    {
      label: 'Hash Generated',
      done: Boolean(candidate?.verification?.hash),
      timestamp: candidate?.verification?.timestamp,
    },
    {
      label: 'Verified on Algorand',
      done: candidate?.verification?.status?.startsWith('Verified'),
      timestamp: candidate?.verification?.timestamp,
    },
  ]

  return (
    <ol className="space-y-3">
      {steps.map((step) => (
        <li key={step.label} className="flex items-start gap-3">
          {step.done ? (
            <CheckCircle2 className="mt-0.5 size-4 text-emerald-400" />
          ) : (
            <CircleDotDashed className="mt-0.5 size-4 text-gray-500" />
          )}
          <div>
            <p className="text-sm text-gray-200">{step.label}</p>
            <p className="text-xs text-gray-500">{step.timestamp ? new Date(step.timestamp).toLocaleString() : 'Pending'}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
