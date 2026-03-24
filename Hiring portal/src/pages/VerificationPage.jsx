import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { ExternalLink } from 'lucide-react'
import { FlowStepper } from '../components/FlowStepper'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { formatDateTime } from '../utils/helpers'
import {
  blockchainNetworkName,
  blockchainNetworkLabel,
  attestationReferenceLabel,
  attestationReferenceValue,
  contractExplorerUrl,
  getLatestAttestation,
  getTxExplorerUrl,
  verifyHash,
} from '../utils/blockchain'
import { VerificationResultBanner } from '../components/VerificationResultBanner'

const shortenHash = (value) => {
  if (!value) return '-'
  if (value.length <= 20) return value
  return `${value.slice(0, 10)}...${value.slice(-8)}`
}

export function VerificationPage({ candidates }) {
  const [hash, setHash] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [verificationState, setVerificationState] = useState('idle')
  const [attestationMeta, setAttestationMeta] = useState(null)

  const verifiedCandidates = useMemo(
    () =>
      candidates
        .filter((candidate) => candidate.verification?.hash)
        .slice(0, 4),
    [candidates],
  )

  const handleVerify = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setVerificationState('pending')
    setAttestationMeta(null)

    const trimmedHash = hash.trim()
    const match = candidates.find(
      (candidate) => candidate.verification?.hash?.toLowerCase() === trimmedHash.toLowerCase(),
    )

    if (!match) {
      setResult(null)
      setError('No matching attestation found for this hash in the current recruiter workspace.')
      setVerificationState('tampered')
      setIsLoading(false)
      toast.error('Attestation hash not found')
      return
    }

    try {
      const [isValid, latestAttestation] = await Promise.all([
        verifyHash(match.attestationId || match.id, trimmedHash),
        getLatestAttestation(match.attestationId || match.id),
      ])

      if (!isValid) {
        setResult(null)
        setAttestationMeta(null)
        setError('Hash exists locally but failed Algorand verification.')
        setVerificationState('tampered')
        toast.error('Verification mismatch')
        return
      }

      setResult(match)
      setAttestationMeta(latestAttestation)
      setError('')
      setVerificationState('verified')
      toast.success('Attestation verified on Algorand')
    } catch {
      setError('Unable to reach Algorand verification services right now. Please try again.')
      setVerificationState('idle')
      setResult(null)
      setAttestationMeta(null)
      toast.error('Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-14">
      <FlowStepper currentStep={4} />

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">On-Chain Attestation Verifier</h1>
            <p className="mt-2 text-sm text-gray-400">
              Validate that a hiring report hash still matches the Algorand attestation.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-gray-950/70 px-4 py-3 text-sm text-gray-300">
            <p className="text-[11px] uppercase tracking-wide text-gray-500">Network</p>
            <p className="mt-1 font-medium text-white">{blockchainNetworkLabel}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-800 bg-gray-950/70 px-3 py-2 text-xs text-gray-300">
            <p className="font-semibold text-indigo-300">Step 1: Candidate Evaluated</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-950/70 px-3 py-2 text-xs text-gray-300">
            <p className="font-semibold text-indigo-300">Step 2: Attestation Written on Algorand</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-950/70 px-3 py-2 text-xs text-gray-300">
            <p className="font-semibold text-indigo-300">Step 3: Integrity Rechecked Independently</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
            <p className="text-[11px] uppercase tracking-wide text-gray-500">{attestationReferenceLabel}</p>
            <a
              href={contractExplorerUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm text-indigo-300 hover:text-indigo-200"
            >
              <span className="font-mono">{attestationReferenceValue}</span>
              <ExternalLink className="size-3.5" />
            </a>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
            <p className="text-[11px] uppercase tracking-wide text-gray-500">What Is Anchored</p>
            <p className="mt-2 text-sm text-gray-300">
              Candidate ID plus the final hiring report hash. Sensitive candidate content stays off-chain.
            </p>
          </div>
        </div>

        <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={handleVerify}>
          <Input
            className="sm:flex-1"
            value={hash}
            onChange={(event) => setHash(event.target.value)}
            placeholder="Paste attestation hash"
          />
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Verifying...' : 'Verify on Algorand'}</Button>
        </form>

        {verifiedCandidates.length > 0 && (
          <div className="mt-5">
            <p className="text-xs uppercase tracking-wide text-gray-500">Quick Demo Attestations</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {verifiedCandidates.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => setHash(candidate.verification.hash)}
                  className="rounded-xl border border-gray-800 bg-gray-950/70 px-3 py-2 text-left text-sm text-gray-300 transition hover:border-indigo-400/50 hover:text-white"
                >
                  <span className="block font-medium text-white">{candidate.name}</span>
                  <span className="block text-xs text-gray-500">{shortenHash(candidate.verification.hash)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      <VerificationResultBanner status={verificationState} />

      {error ? (
        <Card className="border-red-500/30 bg-red-500/10">
          <p className="text-sm font-medium text-red-300">Verification failed</p>
          <p className="mt-1 text-sm text-red-200/90">{error}</p>
        </Card>
      ) : null}

      {result ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <p className="text-xs uppercase tracking-wide text-gray-400">Verified Candidate</p>
            <h2 className="mt-2 text-xl font-semibold text-white">{result.name}</h2>
            <p className="text-sm text-gray-400">{result.email}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Badge success>{result.verification?.status || 'Verified on Algorand'}</Badge>
              <span className="text-sm text-gray-300">Score: {result.analysis?.score}/100</span>
              <span className="text-sm text-gray-300">Timestamp: {formatDateTime(result.verification?.timestamp)}</span>
            </div>
            <div className="mt-4 rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Recruiter Verdict</p>
              <p className="mt-2 text-lg font-semibold text-white">{result.analysis?.assessment?.verdict || 'Verified'}</p>
              <p className="mt-1 text-sm text-gray-400">{result.analysis?.summary}</p>
            </div>
          </Card>

          <Card>
            <p className="text-xs uppercase tracking-wide text-gray-400">Attestation Metadata</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Candidate ID</p>
                <p className="mt-2 break-all font-mono text-sm text-gray-200">{result.attestationId || result.id}</p>
              </div>
              <div className="rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">On-Chain Versions</p>
                <p className="mt-2 text-lg font-semibold text-white">{attestationMeta?.count ?? 1}</p>
              </div>
              <div className="rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Latest On-Chain Timestamp</p>
                <p className="mt-2 text-sm text-gray-200">
                  {typeof attestationMeta?.timestamp === 'number'
                    ? formatDateTime(new Date(attestationMeta.timestamp * 1000).toISOString())
                    : formatDateTime(attestationMeta?.timestamp || result.verification?.timestamp)}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Transaction</p>
                {attestationMeta?.txHash || result.verification?.txHash ? (
                  <a
                    href={getTxExplorerUrl(attestationMeta?.txHash || result.verification?.txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm text-indigo-300 hover:text-indigo-200"
                  >
                    <span className="font-mono">{shortenHash(attestationMeta?.txHash || result.verification?.txHash)}</span>
                    <ExternalLink className="size-3.5" />
                  </a>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">Transaction ID unavailable</p>
                )}
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-100/90">
              This attestation proves the hiring report hash currently matches the record stored on {blockchainNetworkName}.
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
