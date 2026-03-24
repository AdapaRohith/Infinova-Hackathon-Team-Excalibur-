/**
 * Identity Cross-Verification Module
 * Compares the form-entered name, resume-extracted name, and GitHub profile name
 * to detect false claims (e.g., submitting someone else's resume or GitHub).
 */

// Common titles and prefixes to strip before comparison
const TITLE_REGEX = /^(mr\.?|mrs\.?|ms\.?|dr\.?|prof\.?|sir|miss)\s+/i
const SPECIAL_CHARS = /[^a-z\s]/g

/**
 * Normalize a name for comparison:
 * - lowercase
 * - strip titles (Mr/Dr/etc.)
 * - remove special characters
 * - collapse whitespace
 */
const normalize = (name) =>
  String(name || '')
    .toLowerCase()
    .replace(TITLE_REGEX, '')
    .replace(SPECIAL_CHARS, '')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Split a name into tokens (first/middle/last)
 */
const tokenize = (name) =>
  normalize(name)
    .split(' ')
    .filter((t) => t.length >= 2)

/**
 * Check if two names share at least one meaningful token
 * "John Smith" vs "John D. Smith" → true
 * "Rohith Adapa" vs "Sushant K" → false
 */
const hasTokenOverlap = (a, b) => {
  const tokensA = tokenize(a)
  const tokensB = tokenize(b)
  if (!tokensA.length || !tokensB.length) return false
  return tokensA.some((t) => tokensB.includes(t))
}

/**
 * Check if one normalized name contains the other as a substring
 * Handles "Rohith" being inside "Rohith Adapa"
 */
const hasSubstringMatch = (a, b) => {
  const na = normalize(a)
  const nb = normalize(b)
  if (!na || !nb) return false
  return na.includes(nb) || nb.includes(na)
}

/**
 * Simple Levenshtein distance for catching typos
 */
const levenshtein = (a, b) => {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

/**
 * Compare two names and return a match level
 * @returns {'EXACT' | 'CLOSE' | 'PARTIAL' | 'MISMATCH'}
 */
const compareTwoNames = (a, b) => {
  const na = normalize(a)
  const nb = normalize(b)

  // Both empty or one missing → can't compare
  if (!na || !nb) return 'SKIP'

  // Exact match after normalization
  if (na === nb) return 'EXACT'

  // One is a substring of the other (e.g., "Rohith" inside "Rohith Adapa")
  if (hasSubstringMatch(a, b)) return 'CLOSE'

  // Token overlap (e.g., "John Smith" vs "Smith, John")
  if (hasTokenOverlap(a, b)) return 'CLOSE'

  // Levenshtein for typos (threshold: 25% of max length)
  const maxLen = Math.max(na.length, nb.length)
  const dist = levenshtein(na, nb)
  if (dist <= Math.ceil(maxLen * 0.25)) return 'PARTIAL'

  return 'MISMATCH'
}

const isMismatch = (value) => value === 'MISMATCH'

/**
 * Extract the candidate's name from resume text.
 * Resumes almost always start with the person's name on the first line.
 */
export const extractNameFromResume = (resumeText) => {
  if (!resumeText?.trim()) return ''

  const lines = resumeText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  // Strategy: check the first 5 non-empty lines for a name-like pattern
  // A name line is typically short (< 50 chars), has no common section headers,
  // and doesn't look like an email/phone/URL
  const SECTION_REGEX =
    /^(experience|education|skills|technical|projects|summary|profile|objective|employment|certifications|work|contact|address|phone|email)/i
  const CONTACT_REGEX = /[@()+\-\d]{5,}|https?:\/\/|www\./i

  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i]
    if (line.length < 2 || line.length > 50) continue
    if (SECTION_REGEX.test(line)) continue
    if (CONTACT_REGEX.test(line)) continue

    // Likely a name — short text, no special patterns
    return line
  }

  return ''
}

/**
 * Main identity verification function.
 * Compares form name, resume name, and GitHub profile name.
 *
 * @param {Object} params
 * @param {string} params.formName      - Name entered in the form
 * @param {string} params.resumeText    - Full raw text extracted from the resume PDF
 * @param {Object|null} params.githubProfile - GitHub API response (has .name and .login)
 * @returns {Object} Identity verification result
 */
export const verifyIdentity = ({ formName, resumeText, githubProfile }) => {
  const resumeName = extractNameFromResume(resumeText)
  const githubName = githubProfile?.name || ''
  const githubLogin = githubProfile?.login || ''

  // Use the display name if available, else fall back to username
  const effectiveGithubName = githubName || githubLogin

  const flags = []
  const comparisons = {}

  // 1. Compare form name vs resume name
  comparisons.formVsResume = compareTwoNames(formName, resumeName)
  if (comparisons.formVsResume === 'MISMATCH') {
    flags.push('resume_name_mismatch')
  }

  // 2. Compare form name vs GitHub name
  comparisons.formVsGithub = compareTwoNames(formName, effectiveGithubName)
  if (comparisons.formVsGithub === 'MISMATCH') {
    flags.push('github_name_mismatch')
  }

  // 3. Compare resume name vs GitHub name
  comparisons.resumeVsGithub = compareTwoNames(resumeName, effectiveGithubName)
  if (comparisons.resumeVsGithub === 'MISMATCH') {
    flags.push('resume_github_mismatch')
  }

  const mismatchCount = Object.values(comparisons).filter(isMismatch).length
  const allThreeDifferent = mismatchCount === 3
  if (allThreeDifferent) {
    flags.push('all_sources_mismatch')
  }

  // Determine overall status
  let status
  let details

  const hasMismatch = flags.length > 0
  const allSkipped = Object.values(comparisons).every((v) => v === 'SKIP')
  const hasExactOrClose = Object.values(comparisons).some(
    (v) => v === 'EXACT' || v === 'CLOSE',
  )
  const hasPartial = Object.values(comparisons).some((v) => v === 'PARTIAL')

  if (allSkipped) {
    status = 'UNAVAILABLE'
    details = 'Not enough data for identity verification.'
  } else if (hasMismatch) {
    status = 'MISMATCH'
    if (allThreeDifferent) {
      details =
        `Strong identity warning: form name "${formName}" resume name "${resumeName}" and GitHub profile "${effectiveGithubName}" all point to different identities. This may indicate a false claim or someone else's profile/resume was submitted.`
    } else {
      const parts = []
      if (flags.includes('resume_name_mismatch')) {
        parts.push(`Form name "${formName}" does not match resume name "${resumeName}"`)
      }
      if (flags.includes('github_name_mismatch')) {
        parts.push(
          `Form name "${formName}" does not match GitHub profile "${effectiveGithubName}"`,
        )
      }
      if (flags.includes('resume_github_mismatch')) {
        parts.push(
          `Resume name "${resumeName}" does not match GitHub profile "${effectiveGithubName}"`,
        )
      }
      details = parts.join('. ') + '.'
    }
  } else if (hasPartial) {
    status = 'PARTIAL'
    details =
      'Names are similar but not identical across form, resume, and GitHub. Manual review suggested.'
  } else if (hasExactOrClose) {
    status = 'MATCH'
    details = 'Identity verified — names match across form, resume, and GitHub profile.'
  } else {
    status = 'UNAVAILABLE'
    details = 'Could not fully verify identity.'
  }

  return {
    status,
    details,
    formName: formName || '',
    resumeName,
    githubName: effectiveGithubName,
    flags,
    comparisons,
    allThreeDifferent,
  }
}
