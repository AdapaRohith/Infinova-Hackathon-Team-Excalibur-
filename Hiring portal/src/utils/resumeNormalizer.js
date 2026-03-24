import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'

GlobalWorkerOptions.workerSrc = pdfWorker

const SKILL_PATTERNS = [
  { name: 'React', regex: /\breact(?:\.js)?\b/i },
  { name: 'JavaScript', regex: /\bjavascript\b/i },
  { name: 'TypeScript', regex: /\btypescript\b/i },
  { name: 'Node.js', regex: /\bnode(?:\.js)?\b/i },
  { name: 'Python', regex: /\bpython\b/i },
  { name: 'Java', regex: /\bjava\b/i },
  { name: 'Solidity', regex: /\bsolidity\b/i },
  { name: 'Ethers.js', regex: /\bethers(?:\.js)?\b/i },
  { name: 'Web3', regex: /\bweb3\b/i },
  { name: 'Tailwind CSS', regex: /\btailwind\b/i },
  { name: 'Express', regex: /\bexpress\b/i },
  { name: 'MongoDB', regex: /\bmongodb\b/i },
  { name: 'PostgreSQL', regex: /\bpostgres(?:ql)?\b/i },
  { name: 'MySQL', regex: /\bmysql\b/i },
  { name: 'GraphQL', regex: /\bgraphql\b/i },
  { name: 'Redis', regex: /\bredis\b/i },
  { name: 'Docker', regex: /\bdocker\b/i },
  { name: 'Kubernetes', regex: /\bkubernetes|\bk8s\b/i },
  { name: 'AWS', regex: /\baws\b|\bamazon web services\b/i },
  { name: 'Git', regex: /\bgit\b/i },
  { name: 'Next.js', regex: /\bnext(?:\.js)?\b/i },
  { name: 'REST API', regex: /\brest\b.*\bapi\b|\brest api\b/i },
  { name: 'HTML', regex: /\bhtml\b/i },
  { name: 'CSS', regex: /\bcss\b/i },
  { name: 'C++', regex: /\bc\+\+\b/i },
  { name: 'C#', regex: /\bc#\b/i },
  { name: 'Linux', regex: /\blinux\b/i },
  { name: 'Firebase', regex: /\bfirebase\b/i },
  { name: 'Figma', regex: /\bfigma\b/i },
]

const SECTION_BREAK = /\b(?:experience|work experience|employment|projects|education|skills|technical skills|certifications|achievements|summary|profile)\b\s*[:-]?/gi

const cleanText = (value = '') => String(value).replace(/\s+/g, ' ').trim()

const unique = (list) => [...new Set(list.filter(Boolean))]

const getSection = (text, sectionNames) => {
  const source = String(text || '')
  const headings = sectionNames.join('|')
  const regex = new RegExp(`(?:^|\\n)\\s*(?:${headings})\\s*[:-]?\\s*([\\s\\S]*?)(?=\\n\\s*(?:${SECTION_BREAK.source})|$)`, 'i')
  const match = source.match(regex)
  return match ? match[1].trim() : ''
}

const extractLinks = (text) => {
  const matches = text.match(/(?:https?:\/\/|www\.)[\w./?=&%-]+/gi) || []
  return [...new Set(matches.map((link) => link.replace(/[),.;]+$/, '')))]
}

const extractSkills = (text) => {
  const keywordSkills = SKILL_PATTERNS
    .filter((item) => item.regex.test(text))
    .map((item) => item.name)

  const skillsSection = getSection(text, ['skills', 'technical skills', 'tech stack', 'technologies'])
  const sectionMatch = skillsSection.match(/([\s\S]{0,600})/i)
  const sectionSkills = sectionMatch && sectionMatch[1]
    ? sectionMatch[1]
        .split(/[|,\n•]/)
        .map((item) => item.replace(/[^-a-z0-9.+# ]/gi, '').trim())
        .filter((item) => item.length >= 2 && item.length <= 30)
        .map((item) => item.replace(/\b(technical|skills|tools|stack)\b/gi, '').trim())
        .filter(Boolean)
    : []

  return unique([...keywordSkills, ...sectionSkills]).slice(0, 15)
}

const extractExperience = (text) => {
  const experienceSection = getSection(text, ['experience', 'work experience', 'employment'])
  const source = experienceSection || text

  const yearsMatch = text.match(/(\d{1,2})\s*\+?\s*(years?|yrs?)\b/i)
  if (yearsMatch) {
    return `${yearsMatch[1]} years`
  }

  const rangeMatches = [...source.matchAll(/(19\d{2}|20\d{2})\s*(?:-|–|—|to)\s*(present|current|19\d{2}|20\d{2})/gi)]
  if (rangeMatches.length) {
    const thisYear = new Date().getFullYear()
    const spans = rangeMatches.map((match) => {
      const start = Number(match[1])
      const end = /present|current/i.test(match[2]) ? thisYear : Number(match[2])
      return Math.max(0, end - start)
    })
    const maxSpan = Math.max(...spans)
    if (maxSpan > 0) {
      return `${maxSpan} years`
    }
  }

  const monthsMatch = text.match(/(\d{1,2})\s*\+?\s*(months?)\b/i)
  if (monthsMatch) {
    return `${monthsMatch[1]} months`
  }

  if (/intern|fresher|entry[- ]level/i.test(text)) {
    return 'Entry level'
  }

  if (/senior|lead|principal/i.test(text)) {
    return 'Senior'
  }

  if (/mid[- ]level|associate/i.test(text)) {
    return 'Mid'
  }

  return 'Not clearly specified'
}

const extractYearsOfExperience = (text) => {
  const yearsMatches = [...String(text).matchAll(/(\d{1,2})\s*\+?\s*(?:years?|yrs?)\b/gi)]
  if (!yearsMatches.length) return 0
  return Math.max(...yearsMatches.map((match) => Number(match[1]) || 0))
}

const extractProjectHighlights = (text, links) => {
  const projectSection = getSection(text, ['projects', 'project experience'])
  const base = projectSection || text

  const lines = base
    .split(/\n|•/)
    .map((line) => cleanText(line))
    .filter((line) => line.length >= 15)
    .slice(0, 6)

  if (!lines.length && links.length) {
    return links.map((link) => `Project link: ${link}`).slice(0, 3)
  }

  return lines
}

const extractEducation = (text) => {
  const section = getSection(text, ['education'])
  if (!section) return []

  return section
    .split(/\n|•/)
    .map((line) => cleanText(line))
    .filter((line) => line.length >= 10)
    .slice(0, 4)
}

const extractCertifications = (text) => {
  const section = getSection(text, ['certifications', 'licenses'])
  if (!section) return []

  return section
    .split(/\n|•|,/)
    .map((line) => cleanText(line))
    .filter((line) => line.length >= 4)
    .slice(0, 6)
}

const extractEmail = (text) => {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  return match ? match[0] : ''
}

const parsePdfText = async (file) => {
  if (!file) return ''

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await getDocument({ data: arrayBuffer }).promise

  const pageTexts = []
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const rows = new Map()

    for (const item of content.items) {
      const token = cleanText(item.str || '')
      if (!token) continue

      const x = Number(item.transform?.[4] || 0)
      const y = Number(item.transform?.[5] || 0)
      const rowKey = Math.round(y / 2) * 2

      if (!rows.has(rowKey)) {
        rows.set(rowKey, [])
      }

      rows.get(rowKey).push({ x, token })
    }

    const orderedRows = [...rows.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, rowItems]) =>
        rowItems
          .sort((a, b) => a.x - b.x)
          .map((entry) => entry.token)
          .join(' '),
      )

    const pageText = orderedRows.join('\n')

    pageTexts.push(pageText)
  }

  return pageTexts.join('\n')
}

export const normalizeResumePayload = async (payload) => {
  const resumeText = await parsePdfText(payload.resumeFile)
  const extractedEmail = extractEmail(resumeText)
  const links = extractLinks(resumeText)
  const normalizedName = cleanText(payload.name)
  const normalizedEmail = cleanText(payload.email) || extractedEmail
  const normalizedLink = cleanText(payload.link) || links[0] || ''
  const skills = extractSkills(resumeText)
  const safeSkills = skills.length ? skills : ['software development']
  const experience = extractExperience(resumeText)
  const yearsOfExperience = extractYearsOfExperience(resumeText)
  const projects = [normalizedLink, ...links].filter(Boolean)
  const safeProjects = [...new Set(projects)]
  const projectHighlights = extractProjectHighlights(resumeText, safeProjects)
  const education = extractEducation(resumeText)
  const certifications = extractCertifications(resumeText)

  return {
    name: normalizedName,
    email: normalizedEmail,
    link: normalizedLink,
    resumeName: payload.resumeName || payload.resumeFile?.name || '',
    projects: safeProjects.length ? safeProjects : ['not provided'],
    skills: safeSkills,
    experience,
    yearsOfExperience,
    projectHighlights,
    education,
    certifications,
    resumeText,
  }
}
