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

  return { combinedText: combinedText.join('\n'), files }
}

async function computeCid(data) {
  const helia = await createHelia()
  const s = strings(helia)
  const myImmutableAddress = await s.add(data)
  const cid = myImmutableAddress.toString()

  console.log('Corpus CID:', cid)

  return cid
}

async function updateCorpus() {
  const corpusFilePath = path.join(process.cwd(), 'public', 'corpus.json')
  const sourceDir = path.join(process.cwd(), 'public', 'sources')

  let existingCorpus = []
  if (fs.existsSync(corpusFilePath)) {
    existingCorpus = JSON.parse(fs.readFileSync(corpusFilePath, 'utf-8'))
  }

  const { combinedText, files } = await combinePdfTexts(sourceDir)
  const newCid = await computeCid(combinedText)

  const existingCid = existingCorpus.length > 0 ? existingCorpus[0].cid : null
  if (newCid === existingCid) {
    console.log('Same CID: no timestamp update.')
    process.exit(0)
  }

  const timestamp = new Date().toISOString()
  const corpusData = [{ combinedPdfText: combinedText, cid: newCid, timestamp, files }]

  fs.writeFileSync(corpusFilePath, JSON.stringify(corpusData, null, 4))
  console.log('corpus.json updated successfully')

  process.exit(0)
}

updateCorpus().catch((error) => {
  console.error('Error updating corpus.json:', error)
  process.exit(1)
})
