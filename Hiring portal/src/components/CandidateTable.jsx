import { ExternalLink } from 'lucide-react'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { Table, TableBody, TableHead } from './ui/Table'
import { getTxExplorerUrl } from '../utils/blockchain'

export function CandidateTable({ candidates, onViewReport }) {
  if (!candidates.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-900/40 p-8 text-center">
        <p className="text-sm text-gray-200">No candidates match the current filters.</p>
        <p className="mt-2 text-xs text-gray-400">Try widening score range or disabling verified-only mode.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHead>
        <tr>
          <th className="px-4 py-3 font-medium">Name</th>
          <th className="px-4 py-3 font-medium">Score</th>
          <th className="px-4 py-3 font-medium">Verdict</th>
          <th className="px-4 py-3 font-medium">Status</th>
          <th className="px-4 py-3 font-medium">Action</th>
        </tr>
      </TableHead>
      <TableBody>
        {candidates.map((candidate, index) => {
          const explorerUrl = getTxExplorerUrl(candidate.verification?.txHash)

          return (
            <tr key={candidate.id} className="hover:bg-gray-900/80">
              <td className="px-4 py-3">{candidate.name}</td>
              <td className="px-4 py-3">
                <span className="rounded-lg bg-gray-800 px-2 py-1 text-xs text-white">#{index + 1}</span>
                <span className="ml-2">{candidate.analysis?.score ?? '-'}</span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-md px-2 py-1 text-xs font-semibold ${
                    candidate.analysis?.assessment?.verdictTone === 'positive'
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : candidate.analysis?.assessment?.verdictTone === 'negative'
                        ? 'bg-red-500/15 text-red-300'
                        : 'bg-amber-500/15 text-amber-200'
                  }`}
                >
                  {candidate.analysis?.assessment?.verdict || 'Pending'}
                </span>
              </td>
              <td className="px-4 py-3">
                <Badge success={candidate.verification?.status?.startsWith('Verified')}>
                  {candidate.verification?.status ? 'Verified' : 'Not Verified'}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => onViewReport(candidate)}>
                    View Report
                  </Button>
                  <a
                    href={explorerUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => {
                      if (!explorerUrl) event.preventDefault()
                    }}
                    className={`inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                      explorerUrl
                        ? 'border-gray-700 bg-gray-900 text-gray-200 hover:border-indigo-400/60 hover:text-white'
                        : 'cursor-not-allowed border-gray-800 bg-gray-900/50 text-gray-500'
                    }`}
                  >
                    <ExternalLink className="size-3.5" />
                    {explorerUrl ? 'View on AlgoExplorer' : 'No Proof Yet'}
                  </a>
                </div>
              </td>
            </tr>
          )
        })}
      </TableBody>
    </Table>
  )
}
