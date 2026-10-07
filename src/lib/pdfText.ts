interface PdfPage { getTextContent(): Promise<{ items: ({ str: string; hasEOL?: boolean } | object)[] }>; cleanup(): void }
interface PdfDocument { numPages: number; getPage(n: number): Promise<PdfPage> }
interface PdfApi {
  GlobalWorkerOptions: { workerSrc: string }
  getDocument(options: object): { promise: Promise<PdfDocument>; destroy(): Promise<void> }
}
export async function extractPdfText(file: File): Promise<string> {
  if (file.size > 10 * 1024 * 1024) throw Error('pdfSize')
  const bytes = new Uint8Array(await file.arrayBuffer())
  if (!new TextDecoder().decode(bytes.slice(0, 1024)).includes('%PDF-')) throw Error('pdfInvalid')
  // Absolute URLs keep Vite from rewriting public-file imports as source modules.
  const base = new URL(`${import.meta.env.BASE_URL}vendor/pdfjs/`, window.location.href).href
  const moduleUrl = base + 'pdf.min.mjs'
  const pdfjs: PdfApi = await import(/* @vite-ignore */ moduleUrl)
  return readPdfText(bytes, pdfjs, base)
}
// Dependency injection permits exercising the extraction limits without a browser worker.
export async function readPdfText(bytes: Uint8Array, pdfjs: PdfApi, base: string): Promise<string> {
  pdfjs.GlobalWorkerOptions.workerSrc = base + 'pdf.worker.min.mjs'
  const task = pdfjs.getDocument({ data: bytes, isEvalSupported: false, cMapUrl: base + 'cmaps/', cMapPacked: true, standardFontDataUrl: base + 'standard_fonts/' })
  try {
    const pdf = await task.promise
    if (pdf.numPages > 50) throw Error('pdfPages')
    let text = ''
    for (let n = 1; n <= pdf.numPages; n++) {
      const page = await pdf.getPage(n)
      const content = await page.getTextContent()
      text += content.items.map(item => 'str' in item ? item.str + ('hasEOL' in item && item.hasEOL ? '\n' : ' ') : '').join('') + '\n\n'
      page.cleanup()
      if (text.length > 20000) throw Error('pdfLong')
    }
    if (!text.trim()) throw Error('pdfEmpty')
    return text.trim()
  } finally { await task.destroy() }
}
