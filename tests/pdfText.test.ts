import { test, expect, vi, afterEach } from 'vitest'
import { readPdfText, extractPdfText } from '../src/lib/pdfText'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
afterEach(() => vi.unstubAllGlobals())
function makePdf(): Uint8Array {
  const stream = 'BT /F1 12 Tf 30 150 Td (Employee training: ask for clarification.) Tj ET'
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`]
  let pdf = '%PDF-1.4\n'; const offsets = [0]
  objects.forEach((o, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${o}\nendobj\n` })
  const xref = pdf.length
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return new TextEncoder().encode(pdf)
}
test('real bundled PDF.js extracts text from a valid PDF', async () => {
  // Text extraction does not use canvas geometry; Node needs this global at module initialization.
  vi.stubGlobal('DOMMatrix', class {})
  const base = pathToFileURL(resolve('public/vendor/pdfjs') + '/').href
  const pdfjs = await import(/* @vite-ignore */ (base + 'pdf.min.mjs'))
  const text = await readPdfText(makePdf(), pdfjs, base)
  expect(text).toContain('Employee training: ask for clarification.')
})
test('unreadable, oversized and excessive PDF inputs fail without truncation', async () => {
  const destroy = vi.fn(async () => {})
  const api = (pages: number, text: string) => ({ GlobalWorkerOptions: { workerSrc: '' }, getDocument: () => ({ promise: Promise.resolve({ numPages: pages, getPage: async () => ({ getTextContent: async () => ({ items: [{ str: text }] }), cleanup() {} }) }), destroy }) })
  await expect(readPdfText(new Uint8Array(), api(1, ''), '/')).rejects.toThrow('pdfEmpty')
  await expect(readPdfText(new Uint8Array(), api(51, ''), '/')).rejects.toThrow('pdfPages')
  await expect(readPdfText(new Uint8Array(), api(1, 'a'.repeat(20001)), '/')).rejects.toThrow('pdfLong')
  await expect(extractPdfText(new File(['not a pdf'], 'fake.pdf'))).rejects.toThrow('pdfInvalid')
  await expect(extractPdfText({ size: 11 * 1024 * 1024 } as File)).rejects.toThrow('pdfSize')
  expect(destroy).toHaveBeenCalledTimes(3)
})
