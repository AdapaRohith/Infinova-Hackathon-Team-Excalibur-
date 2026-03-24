// Load pdfjs-dist from CDN to avoid Vite bundling issues
const PDFJS_CDN = 'https://unpkg.com/pdfjs-dist@4.9.155/build/pdf.mjs'
const WORKER_CDN = 'https://unpkg.com/pdfjs-dist@4.9.155/build/pdf.worker.mjs'

let _pdfjsLib = null

async function getPdfJs() {
  if (_pdfjsLib) return _pdfjsLib
  // Dynamic import from CDN – bypasses Vite module resolution entirely
  _pdfjsLib = await import(/* @vite-ignore */ PDFJS_CDN)
  _pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_CDN
  return _pdfjsLib
}

export const extractTextFromPDF = async (file) => {
  try {
    const pdfjsLib = await getPdfJs()
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item) => item.str).join(' ')
      fullText += pageText + '\n'
    }
    return fullText.trim()
  } catch (err) {
    console.error('Error extracting text from PDF:', err)
    // Return empty string rather than throwing – the webhook can still receive name/email/link
    return ''
  }
}
