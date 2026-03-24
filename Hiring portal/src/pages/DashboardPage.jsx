import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { CandidateTable } from '../components/CandidateTable'
import { ReportCard } from '../components/ReportCard'
import { Button } from '../components/ui/Button'

export function DashboardPage({ candidates, onClearCandidates }) {
  const [minScore, setMinScore] = useState(0)
  const [maxScore, setMaxScore] = useState(100)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState(null)

  const handleClearDashboard = () => {
    setSelectedCandidate(null)
    onClearCandidates?.()
    toast.success('Dashboard cleared')
  }

  const availableSkills = useMemo(
    () =>
      [...new Set(
        candidates.flatMap((candidate) => candidate.analysis?.skills || candidate.skills || []),
      )].sort((a, b) => a.localeCompare(b)),
    [candidates],
  )

  const filtered = useMemo(
    () =>
      candidates.filter((candidate) => {
        const score = candidate.analysis?.score ?? 0
        const verified = candidate.verification?.status?.startsWith('Verified')
        const matchedSkills = candidate.analysis?.skills || candidate.skills || []
        const matchesSkill = !selectedSkill || matchedSkills.includes(selectedSkill)

        return (
          score >= Number(minScore) &&
          score <= Number(maxScore) &&
          (!verifiedOnly || verified) &&
          matchesSkill
        )
      }),
    [candidates, maxScore, minScore, selectedSkill, verifiedOnly],
  )

  const stats = useMemo(() => {
    const verified = candidates.filter(
      (candidate) => candidate.verification?.status?.startsWith('Verified'),
    ).length
    const trusted = candidates.filter(
      (candidate) => candidate.analysis?.assessment?.verdict === 'Trusted',
    ).length
    const highRisk = candidates.filter(
      (candidate) => candidate.analysis?.assessment?.verdict === 'High Risk',
    ).length
    const avgScore = candidates.length
      ? Math.round(
          candidates.reduce((total, candidate) => total + (candidate.analysis?.score ?? 0), 0) /
            candidates.length,
        )
      : 0

    return {
      total: candidates.length,
      verified,
      trusted,
      highRisk,
      avgScore,
    }
  }, [candidates])

  return (
    <div className="space-y-6 pb-14">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">Total Candidates</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">Verified On Algorand</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-300">{stats.verified}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">Average Score</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.avgScore}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">Trusted</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-300">{stats.trusted}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">High Risk</p>
          <p className="mt-2 text-2xl font-semibold text-red-300">{stats.highRisk}</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-white">Recruiter Dashboard</h1>
            <p className="mt-2 text-sm text-gray-400">Filter and review candidate verification status at a glance.</p>
          </div>
          <Button
            variant="ghost"
            onClick={handleClearDashboard}
            disabled={!candidates.length}
          >
            Clear Dashboard
          </Button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Input
            label="Min Score"
            type="number"
            value={minScore}
            onChange={(event) => setMinScore(event.target.value)}
          />
          <Input
            label="Max Score"
            type="number"
            value={maxScore}
            onChange={(event) => setMaxScore(event.target.value)}
          />
          <label className="flex flex-col gap-2 text-sm text-gray-300">
            <span>Matched Skill</span>
            <select
              value={selectedSkill}
              onChange={(event) => setSelectedSkill(event.target.value)}
              className="rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-gray-300 outline-none transition focus:border-indigo-400/60"
            >
              <option value="">All skills</option>
              {availableSkills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-end gap-3 rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-gray-300 md:col-span-2">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(event) => setVerifiedOnly(event.target.checked)}
              className="size-4 rounded"
            />
            Verified only
          </label>
        </div>
      </Card>

      <CandidateTable candidates={filtered} onViewReport={setSelectedCandidate} />

      <Modal
        open={Boolean(selectedCandidate)}
        title="Candidate Report"
        onClose={() => setSelectedCandidate(null)}
      >
        <ReportCard candidate={selectedCandidate} />
      </Modal>
    </div>
  )
}
