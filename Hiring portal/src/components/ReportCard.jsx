import { Badge } from './ui/Badge'
import { Card } from './ui/Card'
import { ScoreBar } from './ScoreBar'
import { Timeline } from './Timeline'
import { IdentityAlert } from './IdentityAlert'

export function ReportCard({ candidate }) {
  if (!candidate) return null

  const assessment = candidate.analysis.assessment
  const verdictToneClasses = {
    positive: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    caution: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    negative: 'border-red-500/30 bg-red-500/10 text-red-300',
  }
  const evidenceToneClasses = {
    positive: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-200',
    caution: 'border-amber-500/20 bg-amber-500/5 text-amber-100',
    negative: 'border-red-500/20 bg-red-500/5 text-red-200',
  }
  const traceToneClasses = {
    complete: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-200',
    warning: 'border-amber-500/20 bg-amber-500/5 text-amber-100',
    alert: 'border-red-500/20 bg-red-500/5 text-red-200',
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <p className="text-xs uppercase tracking-wide text-gray-400">Candidate</p>
        <h3 className="mt-2 text-xl font-semibold text-white">{candidate.name}</h3>
        <p className="mt-1 text-sm text-gray-400">{candidate.email}</p>
        <a href={candidate.link} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-gray-300 underline-offset-4 hover:underline">
          Portfolio / GitHub
        </a>
        <p className="mt-3 text-xs text-gray-500">Resume: {candidate.resumeName || 'Uploaded file'}</p>
      </Card>

      <Card className="space-y-4 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-wide text-gray-400">AI Evaluation</p>
          <Badge success={candidate.verification?.status?.startsWith('Verified')}>
            {candidate.verification?.status || 'Not Verified'}
          </Badge>
        </div>

        {assessment && (
          <div className={`rounded-2xl border p-4 ${verdictToneClasses[assessment.verdictTone]}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-gray-300/70">Recruiter Decision</p>
                <h4 className="mt-2 text-2xl font-semibold text-white">{assessment.verdict}</h4>
                <p className="mt-1 text-sm text-gray-200/90">
                  Risk: {assessment.riskLevel} • Confidence: {assessment.confidence}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-right">
                <p className="text-[10px] uppercase tracking-wide text-gray-300/70">Trust Signal</p>
                <p className="mt-1 text-lg font-semibold text-white">{candidate.analysis.score}/100</p>
              </div>
            </div>
          </div>
        )}

        <ScoreBar score={candidate.analysis.score} />

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-200">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {(candidate.analysis.skills || candidate.skills || []).map((skill) => (
                  <span key={skill} className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-300 border border-indigo-500/20">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-gray-200">Experience</p>
              <p className="text-sm text-gray-400">{candidate.experience || 'Not specified'}</p>
              {candidate.yearsOfExperience > 0 && (
                <p className="mt-1 text-xs text-gray-500">{candidate.yearsOfExperience} total years detected</p>
              )}
            </div>

            {candidate.education?.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-200">Education</p>
                <ul className="space-y-1 text-xs text-gray-400">
                  {candidate.education.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-200">Strengths</p>
              <ul className="space-y-1 text-sm text-gray-400">
                {candidate.analysis.strengths.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-200">Weaknesses</p>
              <ul className="space-y-1 text-sm text-gray-400">
                {candidate.analysis.weaknesses.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            {candidate.certifications?.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-200">Certifications</p>
                <ul className="space-y-1 text-xs text-gray-400">
                  {candidate.certifications.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
          <p className="mb-2 text-sm font-semibold text-white">AI Summary</p>
          <p className="text-sm text-gray-300 leading-relaxed">{candidate.analysis.summary}</p>
        </div>

        <IdentityAlert identityCheck={candidate.analysis.identityCheck} />

        {assessment?.evidence?.length > 0 && (
          <div className="rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
            <p className="mb-3 text-sm font-semibold text-white">Evidence Snapshot</p>
            <div className="grid gap-3 md:grid-cols-2">
              {assessment.evidence.map((item) => (
                <div
                  key={item.label}
                  className={`rounded-xl border px-3 py-3 text-sm ${evidenceToneClasses[item.tone]}`}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {candidate.analysis.githubVerification && (
          <div className={`rounded-2xl border p-4 ${
            candidate.analysis.githubVerification.status === 'STRONG' 
              ? 'border-emerald-500/30 bg-emerald-500/5' 
              : candidate.analysis.githubVerification.status === 'WEAK'
                ? 'border-red-500/30 bg-red-500/5'
                : 'border-amber-500/30 bg-amber-500/5'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-200">Autonomous Verification Agent</p>
                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  candidate.analysis.githubVerification.status === 'STRONG'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : candidate.analysis.githubVerification.status === 'WEAK'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {candidate.analysis.githubVerification.status === 'STRONG' ? 'Claims Verified' : 
                   candidate.analysis.githubVerification.status === 'WEAK' ? 'False/Weak Claims' :
                   candidate.analysis.githubVerification.status === 'NO_LINK' ? 'No Link Provided' :
                   ['WEBHOOK_ERROR', 'EMPTY_RESPONSE', 'UNREACHABLE', 'UNAVAILABLE'].includes(candidate.analysis.githubVerification.status) ? 'Service Unavailable' :
                   'Manual Review'}
                </span>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase text-gray-500">GitHub Audit Score</p>
                <p className={`text-lg font-bold ${
                  candidate.analysis.githubVerification.score > 70 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {candidate.analysis.githubVerification.score}/100
                </p>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-300 italic">
              " {candidate.analysis.githubVerification.details} "
            </p>
            {candidate.analysis.githubVerification.summary && (
              <div className="mt-3 border-t border-gray-800 pt-3">
                <p className="text-[11px] font-semibold uppercase text-gray-500 mb-1">Audit Summary</p>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {candidate.analysis.githubVerification.summary}
                </p>
              </div>
            )}
          </div>

        )}

        {assessment?.agentTrace?.length > 0 && (
          <div className="rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
            <p className="mb-3 text-sm font-semibold text-white">Agent Trace</p>
            <div className="space-y-3">
              {assessment.agentTrace.map((step) => (
                <div
                  key={step.agent}
                  className={`rounded-xl border px-3 py-3 ${traceToneClasses[step.status]}`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide">{step.agent}</p>
                  <p className="mt-1 text-sm leading-relaxed">{step.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}


        {candidate.analysis.agentSignature && (
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
            <p className="text-xs uppercase tracking-wide text-indigo-300/70">AI Agent Digital Signature (Proof of Evaluation)</p>
            <p className="mt-1 font-mono text-[10px] text-indigo-200/60 break-all">
              {candidate.analysis.agentSignature}
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
          <p className="mb-3 text-sm font-semibold text-gray-200">Verification Timeline</p>
          <Timeline candidate={candidate} />
        </div>

      </Card>
    </div>
  )
}
