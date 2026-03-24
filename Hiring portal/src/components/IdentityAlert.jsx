import { AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react'

/**
 * Displays an identity cross-verification alert banner.
 * Shows MISMATCH (red), PARTIAL (amber), MATCH (green), or nothing if data is unavailable.
 */
export function IdentityAlert({ identityCheck, compact = false }) {
  if (!identityCheck || identityCheck.status === 'UNAVAILABLE') return null

  const config = {
    MISMATCH: {
      icon: <AlertTriangle className="size-5 shrink-0" />,
      border: 'border-red-500/40',
      bg: 'bg-red-500/10',
      iconColor: 'text-red-400',
      titleColor: 'text-red-300',
      textColor: 'text-red-200/80',
      title: '⚠️ False Claim Detected',
      badge: 'bg-red-500/20 text-red-400 border-red-500/30',
      badgeText: 'Identity Mismatch',
    },
    PARTIAL: {
      icon: <HelpCircle className="size-5 shrink-0" />,
      border: 'border-amber-500/40',
      bg: 'bg-amber-500/10',
      iconColor: 'text-amber-400',
      titleColor: 'text-amber-300',
      textColor: 'text-amber-200/80',
      title: 'Partial Match — Manual Review Suggested',
      badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      badgeText: 'Partial Match',
    },
    MATCH: {
      icon: <CheckCircle2 className="size-5 shrink-0" />,
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
      titleColor: 'text-emerald-300',
      textColor: 'text-emerald-200/80',
      title: 'Identity Verified',
      badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      badgeText: 'Identity Match',
    },
  }

  const c = config[identityCheck.status]
  if (!c) return null

  // Compact mode: just a small badge (used in tables)
  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${c.badge}`}
      >
        {identityCheck.status === 'MISMATCH' ? '⚠️' : identityCheck.status === 'MATCH' ? '✓' : '?'} {c.badgeText}
      </span>
    )
  }

  return (
    <div
      className={`rounded-2xl border ${c.border} ${c.bg} p-4`}
    >
      <div className="flex items-start gap-3">
        <div className={c.iconColor}>{c.icon}</div>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold ${c.titleColor}`}>{c.title}</p>
          <p className={`mt-1 text-sm ${c.textColor}`}>{identityCheck.details}</p>

          {identityCheck.status !== 'MATCH' && (
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-800 bg-gray-950/50 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-gray-500">Form Name</p>
                <p className="mt-0.5 text-sm font-medium text-white">
                  {identityCheck.formName || '—'}
                </p>
              </div>
              <div className="rounded-lg border border-gray-800 bg-gray-950/50 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-gray-500">Resume Name</p>
                <p className="mt-0.5 text-sm font-medium text-white">
                  {identityCheck.resumeName || '—'}
                </p>
              </div>
              <div className="rounded-lg border border-gray-800 bg-gray-950/50 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-gray-500">GitHub Profile</p>
                <p className="mt-0.5 text-sm font-medium text-white">
                  {identityCheck.githubName || '—'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
