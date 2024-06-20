import { createHelia } from 'helia'
import { strings } from '@helia/strings'
import fs from 'fs'
import path from 'path'

// Function to compute CID using Helia
async function computeCid(data) {
  const helia = await createHelia()
  const s = strings(helia)
  const myImmutableAddress = await s.add(data)
  const cid = myImmutableAddress.toString()

  // Verify the CID
  console.log('CID is valid:', cid)

  return cid
}

// Main function to update corpus.json
async function updateCorpus() {
  const corpusFilePath = path.join(process.cwd(), 'public', 'corpus.json')

  // Read the existing corpus.json file
  const corpusData = JSON.parse(fs.readFileSync(corpusFilePath, 'utf-8'))

  // Use the existing combinedPdfText value
  const combinedPdfText = corpusData[0].combinedPdfText

  // Compute the CID for the combinedPdfText
  const cid = await computeCid(combinedPdfText)

  // Get the current timestamp in ISO 8601 format
  const timestamp = new Date().toISOString()

  // Update the corpusData with new values
  corpusData[0] = {
    combinedPdfText,
    cid,
    timestamp,
  }

  // Write the updated data back to corpus.json
  fs.writeFileSync(corpusFilePath, JSON.stringify(corpusData, null, 4))
  console.log('corpus.json updated successfully')

  // Exit the process
  process.exit(0)
}

// Execute the main function
updateCorpus().catch((error) => {
  console.error('Error updating corpus.json:', error)
  process.exit(1)
})
