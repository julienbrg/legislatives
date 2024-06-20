import { createHelia } from 'helia'
import { strings } from '@helia/strings'
import fs from 'fs'
import path from 'path'

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
  const corpusData = JSON.parse(fs.readFileSync(corpusFilePath, 'utf-8'))
  const combinedPdfText = corpusData[0].combinedPdfText
  const cid = await computeCid(combinedPdfText)
  const timestamp = new Date().toISOString()
  corpusData[0] = {
    combinedPdfText,
    cid,
    timestamp,
  }

  fs.writeFileSync(corpusFilePath, JSON.stringify(corpusData, null, 4))
  console.log('corpus.json updated successfully')

  process.exit(0)
}

updateCorpus().catch((error) => {
  console.error('Error updating corpus.json:', error)
  process.exit(1)
})
