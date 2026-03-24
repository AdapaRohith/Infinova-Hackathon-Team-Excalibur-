import { deriveAttestationId } from './attestationIdentity'

const STORAGE_KEY = 'powf-candidates'

export const loadCandidates = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)

    return Array.isArray(parsed)
      ? parsed.map((candidate) => ({
          ...candidate,
          attestationId: candidate.attestationId || deriveAttestationId(candidate.email, candidate.id),
        }))
      : []
  } catch {
    return []
  }
}

export const saveCandidates = (candidates) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates))
  } catch {
    // ignore storage errors
  }
}
