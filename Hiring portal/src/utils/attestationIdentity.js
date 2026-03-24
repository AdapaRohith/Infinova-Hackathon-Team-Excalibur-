import SHA256 from 'crypto-js/sha256'

const normalizeEmail = (email = '') => String(email).trim().toLowerCase()

export const deriveAttestationId = (email = '', fallbackId = '') => {
  const normalizedEmail = normalizeEmail(email)

  if (normalizedEmail) {
    return `cand_${SHA256(normalizedEmail).toString().slice(0, 24)}`
  }

  return fallbackId || `candidate_${crypto.randomUUID()}`
}
