import { useEffect, useReducer } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Navbar } from './components/Navbar'
import { LandingPage } from './pages/LandingPage'
import { CandidateAnalysisPage } from './pages/CandidateAnalysisPage'
import { AIReportPage } from './pages/AIReportPage'
import { DashboardPage } from './pages/DashboardPage'
import { VerificationPage } from './pages/VerificationPage'
import { loadCandidates, saveCandidates } from './utils/storage'
import { generateHash } from './utils/hash'
import { isTransactionConfirmed, storeHash } from './utils/blockchain'
import { normalizeResumePayload } from './utils/resumeNormalizer'
import { verifyIdentity } from './utils/identityVerifier'
import { synthesizeCandidateAssessment } from './utils/analysisSynthesizer'
import { deriveAttestationId } from './utils/attestationIdentity'

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ANALYSIS':
      return [action.payload, ...state]
    case 'ADD_BLOCKCHAIN_PROOF':
      return state.map((candidate) =>
        candidate.id === action.payload.id
          ? {
              ...candidate,
              verification: {
                hash: action.payload.hash,
                timestamp: action.payload.timestamp,
                txHash: action.payload.txHash,
                status: action.payload.confirmed ? 'Verified on Algorand' : 'Pending on Algorand',
                senderAddress: action.payload.senderAddress,
                history: [
                  ...(candidate.verification?.history ?? []),
                  {
                    hash: action.payload.hash,
                    timestamp: action.payload.timestamp,
                    txHash: action.payload.txHash,
                    senderAddress: action.payload.senderAddress,
                    confirmed: action.payload.confirmed,
                  },
                ],
              },
            }
          : candidate,
      )
    case 'MARK_BLOCKCHAIN_CONFIRMED':
      return state.map((candidate) =>
        candidate.id === action.payload.id && candidate.verification
          ? {
              ...candidate,
              verification: {
                ...candidate.verification,
                status: 'Verified on Algorand',
                timestamp: action.payload.timestamp || candidate.verification.timestamp,
                txHash: action.payload.txHash || candidate.verification.txHash,
                history: (candidate.verification.history ?? []).map((item) =>
                  item.txHash === action.payload.txHash
                    ? { ...item, confirmed: true }
                    : item,
                ),
              },
            }
          : candidate,
      )
    case 'CLEAR_CANDIDATES':
      return []
    default:
      return state
  }
}

const toStructuredAnalysis = (rawText = '') => {
  const text = String(rawText)

  const scoreMatch = text.match(/Score\s*:\s*(\d+)/i)
  const summaryMatch = text.match(/Summary\s*:\s*([\s\S]*?)(?:\n\s*(?:Strengths|Skills)\s*:|$)/i)
  const strengthsMatch = text.match(/Strengths\s*:\s*([\s\S]*?)(?:\n\s*(?:Weaknesses|Skills)\s*:|$)/i)
  const weaknessesMatch = text.match(/Weaknesses\s*:\s*([\s\S]*?)(?:\n\s*(?:Skills)\s*:|$)/i)
  const skillsMatch = text.match(/Skills\s*:\s*([\s\S]*)$/i)

  const parseBulletList = (sectionText) =>
    String(sectionText || '')
      .split(/[,\n•]/)
      .map((line) => line.replace(/^\s*[-•]\s*/, '').trim())
      .filter(Boolean)

  return {
    score: scoreMatch ? Number(scoreMatch[1]) : 0,
    summary: summaryMatch ? summaryMatch[1].trim() : text.trim(),
    strengths: parseBulletList(strengthsMatch?.[1]),
    weaknesses: parseBulletList(weaknessesMatch?.[1]),
    skills: parseBulletList(skillsMatch?.[1]),
  }
}

const fetchGitHubData = async (link) => {
  try {
    const match = String(link).match(/github\.com\/([a-zA-Z0-9_-]+)/i)
    if (!match) return null

    const username = match[1]
    console.log('Fetching GitHub data for:', username)

    const [profileRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`),
      fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=15`),
    ])

    if (!profileRes.ok) {
      console.warn('GitHub profile API returned', profileRes.status)
      return null
    }

    const profile = await profileRes.json()
    const repos = reposRes.ok ? await reposRes.json() : []

    return {
      username: profile.login,
      login: profile.login,
      name: profile.name || '',
      bio: profile.bio || '',
      public_repos: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      repos: repos.map((repo) => ({
        name: repo.name,
        description: repo.description || '',
        language: repo.language || 'Unknown',
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        updated_at: repo.updated_at,
        topics: repo.topics || [],
        homepage: repo.homepage || '',
      })),
    }
  } catch (error) {
    console.warn('Failed to fetch GitHub data:', error)
    return null
  }
}

const verifyGitHubWithAI = async (link, skills, resumeText, githubDataInput = null) => {
  let trimmedLink = String(link || '').trim()

  if (trimmedLink && !trimmedLink.startsWith('http')) {
    trimmedLink = `https://${trimmedLink}`
  }

  if (!trimmedLink || trimmedLink.length < 10) {
    console.warn('No valid link provided for GitHub verification:', link)
    return {
      score: 0,
      status: 'NO_LINK',
      details: 'No valid GitHub/portfolio link was provided. Please enter a valid URL to enable autonomous verification.',
      summary: '',
    }
  }

  console.log('Normalized GitHub link:', trimmedLink)

  const githubData = githubDataInput || await fetchGitHubData(trimmedLink)
  console.log('GitHub API data fetched:', githubData ? `${githubData.public_repos} repos found` : 'failed')

  const maxRetries = 2
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const response = await fetch('https://n8n.avlokai.com/webhook/verify-github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ link: trimmedLink, skills, resumeText, githubData }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.warn(`verify-github webhook returned status ${response.status} (attempt ${attempt}/${maxRetries})`)
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1500 * attempt))
          continue
        }

        return {
          score: 0,
          status: 'WEBHOOK_ERROR',
          details: `Verification service returned an error (HTTP ${response.status}). The GitHub audit could not be completed - please retry or verify manually.`,
          summary: '',
        }
      }

      const rawBody = await response.text()
      if (!rawBody?.trim()) {
        console.warn(`verify-github webhook returned empty body (attempt ${attempt}/${maxRetries})`)
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1500 * attempt))
          continue
        }

        return {
          score: 0,
          status: 'EMPTY_RESPONSE',
          details: 'Verification service returned an empty response. The n8n workflow may not be configured to respond. Please check your webhook setup.',
          summary: '',
        }
      }

      let rawData = JSON.parse(rawBody)
      let data = Array.isArray(rawData) ? rawData[0] : rawData

      let aiText = ''
      if (typeof data.output === 'string') {
        aiText = data.output
      } else if (data.output?.[0]?.text) {
        aiText = data.output[0].text
      } else if (data.output?.[0]?.content?.[0]?.text) {
        aiText = data.output[0].content[0].text
      } else if (data.text) {
        aiText = data.text
      }

      if (aiText && typeof aiText === 'string') {
        try {
          const start = aiText.indexOf('{')
          const end = aiText.lastIndexOf('}')
          if (start !== -1 && end !== -1) {
            const jsonString = aiText.substring(start, end + 1)
            const parsed = JSON.parse(jsonString)
            data = { ...data, ...parsed }
          }
        } catch (error) {
          console.warn('AI output was not valid JSON:', error)
        }
      }

      return {
        score: data.github_score ?? 0,
        status: data.verdict || 'PENDING',
        details: data.reason || 'Verification complete.',
        summary: data.detailed_summary || data.reason || '',
      }
    } catch (error) {
      const isTimeout = error.name === 'AbortError'
      console.error(`GitHub verification failed (attempt ${attempt}/${maxRetries}):`, error)

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1500 * attempt))
        continue
      }

      return {
        score: 0,
        status: 'UNREACHABLE',
        details: isTimeout
          ? 'Verification service timed out. The n8n webhook took too long to respond - please check that your workflow is active and retry.'
          : 'Could not connect to the verification service. Please check that the n8n webhook is active and your network connection is stable.',
        summary: '',
      }
    }
  }

  return null
}

const analyzeCandidateWithAI = async (payload) => {
  console.log('Sending payload to n8n analyze-candidate webhook', payload)

  const response = await fetch('https://n8n.avlokai.com/webhook/analyze-candidate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`n8n webhook request failed with status ${response.status}`)
  }

  const rawBody = await response.text()
  if (!rawBody?.trim()) {
    throw new Error('n8n returned an empty response body. Check Respond to Webhook node output.')
  }

  let data
  try {
    const parsed = JSON.parse(rawBody)
    console.log('Raw data received from n8n:', parsed)
    data = Array.isArray(parsed) ? parsed[0] : parsed
  } catch {
    throw new Error('n8n returned non-JSON content. Ensure webhook response format is JSON.')
  }

  if (data?.report) {
    return {
      score: Number(data.report.score ?? 0),
      skills: Array.isArray(data.report.skills) ? data.report.skills : [],
      summary: String(data.report.summary ?? ''),
      strengths: Array.isArray(data.report.strengths) ? data.report.strengths : [],
      weaknesses: Array.isArray(data.report.weaknesses) ? data.report.weaknesses : [],
      agentSignature: data.report.agentSignature || null,
    }
  }

  if (data?.score !== undefined || data?.summary !== undefined) {
    return {
      score: Number(data.score ?? 0),
      skills: Array.isArray(data.skills) ? data.skills : [],
      summary: String(data.summary ?? ''),
      strengths: Array.isArray(data.strengths) ? data.strengths : [],
      weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
      agentSignature: data.agentSignature || null,
    }
  }

  if (typeof data?.text === 'string' && data.text.trim()) {
    return toStructuredAnalysis(data.text)
  }

  throw new Error('n8n response is missing report payload')
}

function App() {
  const [candidates, dispatch] = useReducer(reducer, [], loadCandidates)
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    saveCandidates(candidates)
  }, [candidates])

  const scheduleConfirmationCheck = (candidateId, txHash, attempt = 0) => {
    const maxAttempts = 10
    const retryDelayMs = 15000

    window.setTimeout(async () => {
      try {
        const confirmed = await isTransactionConfirmed(txHash)
        if (confirmed) {
          dispatch({
            type: 'MARK_BLOCKCHAIN_CONFIRMED',
            payload: {
              id: candidateId,
              txHash,
              timestamp: new Date().toISOString(),
            },
          })
          return
        }

        if (attempt + 1 < maxAttempts) {
          scheduleConfirmationCheck(candidateId, txHash, attempt + 1)
        }
      } catch (error) {
        console.warn('Algorand confirmation recheck failed:', error)
        if (attempt + 1 < maxAttempts) {
          scheduleConfirmationCheck(candidateId, txHash, attempt + 1)
        }
      }
    }, retryDelayMs)
  }

  const handleAnalyzeCandidate = async (payload) => {
    await new Promise((resolve) => {
      setTimeout(resolve, 1000)
    })

    let normalized
    try {
      normalized = await normalizeResumePayload(payload)
    } catch (error) {
      console.error('Resume normalization failed, using direct form payload.', error)
      normalized = {
        name: payload.name,
        email: payload.email,
        link: payload.link,
        resumeName: payload.resumeName,
        projects: payload.link ? [payload.link] : [],
        skills: [],
        experience: '',
        yearsOfExperience: 0,
        projectHighlights: payload.link ? [`Project link: ${payload.link}`] : [],
        education: [],
        certifications: [],
        resumeText: '',
      }
    }

    const aiInput = { ...normalized }
    const githubDataPromise = fetchGitHubData(normalized.link)
    const [aiReport, githubData] = await Promise.all([
      analyzeCandidateWithAI(aiInput),
      githubDataPromise,
    ])

    const [githubVerification, identityCheck] = await Promise.all([
      verifyGitHubWithAI(normalized.link, normalized.skills, normalized.resumeText, githubData),
      Promise.resolve(
        verifyIdentity({
          formName: normalized.name,
          resumeText: normalized.resumeText,
          githubProfile: githubData
            ? {
                name: githubData.name,
                login: githubData.login || githubData.username,
              }
            : null,
        }),
      ),
    ])

    const assessment = synthesizeCandidateAssessment({
      analysis: aiReport,
      identityCheck,
      githubVerification,
      candidate: {
        ...normalized,
        analysis: aiReport,
      },
    })

    const candidate = {
      id: crypto.randomUUID(),
      ...normalized,
      attestationId: deriveAttestationId(normalized.email),
      createdAt: new Date().toISOString(),
      analysis: {
        ...aiReport,
        skills: aiReport.skills?.length ? aiReport.skills : normalized.skills,
        githubVerification: githubVerification || {
          score: 0,
          status: 'UNAVAILABLE',
          details: 'GitHub verification could not be completed at this time. Please retry the analysis.',
          summary: '',
        },
        identityCheck,
        assessment,
      },
      verification: null,
    }

    dispatch({ type: 'ADD_ANALYSIS', payload: candidate })
    return candidate
  }

  const handleGenerateProof = async (candidateId, onStatusChange) => {
    const candidate = candidates.find((item) => item.id === candidateId)
    if (!candidate) return null

    try {
      const hash = generateHash(candidate.analysis)
      const attestationId = candidate.attestationId || deriveAttestationId(candidate.email, candidate.id)
      const tx = await storeHash(attestationId, hash, onStatusChange)

      dispatch({
        type: 'ADD_BLOCKCHAIN_PROOF',
        payload: {
          id: candidateId,
          attestationId,
          hash,
          txHash: tx.txHash,
          timestamp: tx.timestamp,
          senderAddress: tx.senderAddress,
          confirmed: tx.confirmed,
        },
      })

      if (!tx.confirmed) {
        scheduleConfirmationCheck(candidateId, tx.txHash)
      }

      return {
        attestationId,
        hash,
        txHash: tx.txHash,
        timestamp: tx.timestamp,
        senderAddress: tx.senderAddress,
        confirmed: tx.confirmed,
      }
    } catch (error) {
      console.error('Blockchain error:', error)
      throw error
    }
  }

  const handleRefreshProofStatus = async (candidateId) => {
    const candidate = candidates.find((item) => item.id === candidateId)
    const txHash =
      candidate?.verification?.txHash ||
      candidate?.verification?.history?.slice(-1)[0]?.txHash
    if (!candidate || !txHash) return false

    try {
      const confirmed = await isTransactionConfirmed(txHash)
      if (!confirmed) return false

      dispatch({
        type: 'MARK_BLOCKCHAIN_CONFIRMED',
        payload: {
          id: candidateId,
          txHash,
          timestamp: new Date().toISOString(),
        },
      })
      return true
    } catch (error) {
      console.warn('Algorand confirmation refresh failed:', error)
      return false
    }
  }

  const handleClearCandidates = () => {
    dispatch({ type: 'CLEAR_CANDIDATES' })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/analyze"
            element={
              <CandidateAnalysisPage
                onAnalyzeCandidate={handleAnalyzeCandidate}
                onGenerateProof={handleGenerateProof}
              />
            }
          />
          <Route
            path="/report/:candidateId"
            element={
              <AIReportPage
                candidates={candidates}
                onGenerateProof={handleGenerateProof}
                onRefreshProofStatus={handleRefreshProofStatus}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <DashboardPage
                candidates={candidates}
                onClearCandidates={handleClearCandidates}
              />
            }
          />
          <Route path="/verify" element={<VerificationPage candidates={candidates} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111827',
            color: '#ffffff',
            border: '1px solid rgba(55, 65, 81, 1)',
          },
        }}
      />
    </div>
  )
}

export default App
