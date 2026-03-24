import { useState } from 'react'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CheckCircle2, ShieldCheck, ShieldAlert } from 'lucide-react'
import { FlowStepper } from '../components/FlowStepper'

import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { Loader } from '../components/ui/Loader'
import { ScoreBar } from '../components/ScoreBar'
import { IdentityAlert } from '../components/IdentityAlert'

const initialForm = {
  name: '',
  email: '',
  link: '',
  resumeName: '',
  resumeFile: null,
}

export function CandidateAnalysisPage({ onAnalyzeCandidate, onGenerateProof }) {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [proofLoading, setProofLoading] = useState(false)
  const [result, setResult] = useState(null)
  const navigate = useNavigate()

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.name || !form.email || !form.link) {
      toast.error('Please complete required fields')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const candidate = await onAnalyzeCandidate(form)
      setResult(candidate)
      toast.success('AI analysis complete')
    } catch (error) {
      toast.error(error?.message || 'Real AI analysis failed. Verify your n8n webhook is active and reachable.')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateProof = async () => {
    if (!result) return

    setProofLoading(true)

    try {
      const proof = await onGenerateProof?.(result.id)
      if (proof) {
        setResult((prev) =>
          prev
            ? {
                ...prev,
                verification: {
                  ...(prev.verification || {}),
                  hash: proof.hash,
                  txHash: proof.txHash,
                  timestamp: proof.timestamp,
                  status: proof.confirmed ? 'Verified on Algorand' : 'Pending on Algorand',
                  history: [
                    ...((prev.verification?.history || []).filter(
                      (item) => item.hash !== proof.hash || item.txHash !== proof.txHash,
                    )),
                    {
                      hash: proof.hash,
                      txHash: proof.txHash,
                      timestamp: proof.timestamp,
                      confirmed: proof.confirmed,
                    },
                  ],
                },
              }
            : prev,
        )
        toast.success(proof.confirmed ? 'Blockchain proof confirmed' : 'Blockchain proof submitted')
      }
    } catch (error) {
      toast.error(error?.message || 'Blockchain proof generation failed.')
    } finally {
      setProofLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-14">
      <FlowStepper currentStep={2} />

      <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <h1 className="text-2xl font-semibold text-white">Candidate Analysis</h1>
        <p className="mt-2 text-sm text-gray-400">Run AI skill verification and generate a trusted candidate profile.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Name"
            value={form.name}
            onChange={(event) => handleChange('name', event.target.value)}
            placeholder="Avery Quinn"
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) => handleChange('email', event.target.value)}
            placeholder="avery@candidate.dev"
            required
          />
          <label className="flex flex-col gap-2 text-sm text-gray-300">
            <span>Resume Upload</span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(event) => {
                const file = event.target.files?.[0] || null
                handleChange('resumeFile', file)
                handleChange('resumeName', file?.name || '')
              }}
              className="rounded-2xl border border-gray-800 bg-gray-950 px-4 py-2.5 text-sm text-gray-300"
            />
          </label>
          <Input
            label="GitHub / Portfolio"
            value={form.link}
            onChange={(event) => handleChange('link', event.target.value)}
            placeholder="https://github.com/avery"
            required
          />
          <Button className="w-full" disabled={loading}>
            {loading ? 'Analyzing with AI...' : 'Analyze with AI'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setForm(initialForm)}
          >
            Clear Form
          </Button>
        </form>
      </Card>

      <Card className="lg:col-span-3">
        <h2 className="text-xl font-semibold text-white">AI Output</h2>
        <p className="mt-1 text-sm text-gray-400">AI insights fetched from your n8n workflow.</p>

        <AnimatePresence mode="wait">
          {loading ? (
            <Motion.div
              key="loading"
              className="mt-6 space-y-4"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <Loader label="Analyzing candidate resume..." />
              <Loader label="Verifying code repositories..." />
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-20 w-full" />
            </Motion.div>
          ) : null}

          {!loading && result ? (
            <Motion.div
              key="result"
              className="mt-6 space-y-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="size-4" /> AI Evaluation Complete
                  </p>
                  {result.analysis.githubVerification && (
                    <p className={`text-[11px] font-medium flex items-center gap-1 ${
                      result.analysis.githubVerification.status === 'STRONG' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {result.analysis.githubVerification.status === 'STRONG' ? <ShieldCheck className="size-3" /> : <ShieldAlert className="size-3" />}
                      {result.analysis.githubVerification.status === 'STRONG' ? 'Autonomous GitHub Verification: Pass' : 'GitHub Verification: Manual Review Suggested'}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {(result.analysis.skills || result.skills || []).slice(0, 5).map(skill => (
                    <span key={skill} className="rounded-md bg-gray-800 px-1.5 py-0.5 text-[10px] text-gray-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              
              <ScoreBar score={result.analysis.score} />
              
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
                  <p className="text-sm font-semibold text-white">Strengths</p>
                  <p className="mt-2 text-sm text-gray-300">{result.analysis.strengths.join(', ')}</p>
                </div>
                <div className="rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
                  <p className="text-sm font-semibold text-white">Weaknesses</p>
                  <p className="mt-2 text-sm text-gray-300">{result.analysis.weaknesses.join(', ')}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
                <p className="text-sm font-semibold text-white">AI Summary</p>
                <p className="mt-2 text-sm text-gray-300 line-clamp-3">{result.analysis.summary}</p>
              </div>
              {result.analysis.assessment && (
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-gray-500">Verdict</p>
                    <p className="mt-2 text-lg font-semibold text-white">{result.analysis.assessment.verdict}</p>
                  </div>
                  <div className="rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-gray-500">Risk</p>
                    <p className="mt-2 text-lg font-semibold text-white">{result.analysis.assessment.riskLevel}</p>
                  </div>
                  <div className="rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-gray-500">Confidence</p>
                    <p className="mt-2 text-lg font-semibold text-white">{result.analysis.assessment.confidence}</p>
                  </div>
                </div>
              )}
              <IdentityAlert identityCheck={result.analysis.identityCheck} />
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/report/${result.id}`)}
                >
                  Open AI Report
                </Button>
                <Button
                  variant={result.verification?.status ? 'success' : 'primary'}
                  disabled={proofLoading}
                  onClick={handleGenerateProof}
                >
                  {proofLoading
                    ? 'Generating Proof...'
                    : result.verification?.status
                      ? 'Regenerate Proof'
                      : 'Generate Proof'}
                </Button>
              </div>
            </Motion.div>
          ) : null}

          {!loading && !result ? (
            <Motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 rounded-2xl border border-dashed border-gray-700 p-6 text-sm text-gray-400"
            >
              Submit a candidate to fetch real AI analysis from n8n.
            </Motion.div>
          ) : null}
        </AnimatePresence>
      </Card>
      </div>
    </div>
  )
}
