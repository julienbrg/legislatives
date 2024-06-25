import { createHelia } from 'helia'
import { strings } from '@helia/strings'
import fs from 'fs'
import path from 'path'
import pdf from 'pdf-parse-debugging-disabled'

async function extractTextFromPdf(pdfPath) {
  try {
    const dataBuffer = fs.readFileSync(pdfPath)
    const data = await pdf(dataBuffer)
    return data.text
  } catch (error) {
    console.error(`Error reading PDF file ${pdfPath}:`, error)
    return ''
  }
}

async function combinePdfTexts(sourceDir) {
  const files = fs.readdirSync(sourceDir).filter((file) => file.endsWith('.pdf'))
  const combinedText = []

  for (const file of files) {
    const filePath = path.join(sourceDir, file)
    const text = await extractTextFromPdf(filePath)
    combinedText.push(text)
  }

  return combinedText.join('\n')
}

async function computeCid(data) {
  const helia = await createHelia()
  const s = strings(helia)
  const myImmutableAddress = await s.add(data)
  const cid = myImmutableAddress.toString()

  console.log('CID is valid:', cid)

  return cid
}

async function updateCorpus() {
  const corpusFilePath = path.join(process.cwd(), 'public', 'corpus.json')
  const sourceDir = path.join(process.cwd(), 'public', 'sources')

  const combinedPdfText = await combinePdfTexts(sourceDir)
  const cid = await computeCid(combinedPdfText)
  const timestamp = new Date().toISOString()

  const corpusData = [{ combinedPdfText, cid, timestamp }]

  fs.writeFileSync(corpusFilePath, JSON.stringify(corpusData, null, 4))
  console.log('corpus.json updated successfully')

  process.exit(0)
}

updateCorpus().catch((error) => {
  console.error('Error updating corpus.json:', error)
  process.exit(1)
})
