import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import fetch from 'node-fetch'
import pdfParse from 'pdf-parse'
import fs from 'fs'
import path from 'path'
import { createHelia } from 'helia'
import { strings } from '@helia/strings'

type Data = {
  assistantResponse: any
  combinedPdfText: string
  cid?: string
}

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
const openai = new OpenAI({ apiKey })

async function fetchAndExtractTextFromPDF(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF file from ${url}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const data = await pdfParse(buffer)
  return data.text
}

async function fetchAllPDFTexts(baseUrl: string): Promise<string[]> {
  const sourcesDir = path.join(process.cwd(), 'public', 'sources')
  const files = fs.readdirSync(sourcesDir)
  const pdfFiles = files.filter((file) => file.endsWith('.pdf'))
  const pdfTexts: string[] = []

  for (const file of pdfFiles) {
    try {
      const pdfUrl = `${baseUrl}/sources/${file}`
      console.log('Fetching PDF from:', pdfUrl)
      const pdfText = await fetchAndExtractTextFromPDF(pdfUrl)
      pdfTexts.push(pdfText)
    } catch (error) {
      console.error(`Error processing file ${file}:`, error)
    }
  }

  return pdfTexts
}

async function computeCid(data: string): Promise<string> {
  const helia = await createHelia()
  const s = strings(helia)
  const myImmutableAddress = await s.add(data)
  return myImmutableAddress.toString()
}

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    res.status(405).json({ assistantResponse: 'Method not allowed', combinedPdfText: '' })
    return
  }

  const { content } = req.body

  if (!content) {
    res.status(400).json({ assistantResponse: 'Content is required', combinedPdfText: '' })
    return
  }

  // Derive baseUrl from request headers
  const protocol = req.headers['x-forwarded-proto'] || 'http'
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const baseUrl = `${protocol}://${host}`
  console.log('baseUrl:', baseUrl)

  try {
    const pdfTexts = await fetchAllPDFTexts(baseUrl)
    const combinedPdfText = pdfTexts.join('\n\n')

    try {
      // Overwrite the value of combinedPdfText in corpus.json
      const corpusFilePath = path.join(process.cwd(), 'public', 'corpus.json')
      const corpusData = JSON.parse(fs.readFileSync(corpusFilePath, 'utf-8'))

      // Get the current timestamp in ISO 8601 format
      const timestamp = new Date().toISOString()

      corpusData[0] = {
        combinedPdfText,
        cid: corpusData[0].cid, // Keep the existing CID
        timestamp,
      }

      // Write the updated data back to corpus.json
      fs.writeFileSync(corpusFilePath, JSON.stringify(corpusData, null, 4))
      console.log('corpus.json updated successfully')
    } catch (e) {
      console.log("can't write to corpus.json when online ", e)
    }

    console.log('combinedPdfText length:', combinedPdfText.length)

    const call = async (content: string, combinedPdfText: string) => {
      // const completion = await openai.chat.completions.create({
      //   messages: [
      //     { role: 'system', content: "Réponds systématiquement en français. Vovoie l'utilisateur" },
      //     {
      //       role: 'system',
      //       content:
      //         "Talk and answer as if you are Fatou, a young French woman. The additional text provided are Fatou's sources, so it should be referred to as 'my sources'. She will never express her own political opinion: she's here to help citizens make their choice. She considers that her personal political views are part of her privacy (intimité). She finds it important to go vote on June 30 and July 7. Instead of inviting people to go read the programs, she suggests asking another question.",
      //     },
      //     {
      //       role: 'system',
      //       content:
      //         "Le NFP c'est le Nouveau Front Populaire. Le FN, c'est le RN, c'est-à-dire le Front National (renommé récemment 'Rassemblement National')",
      //     },
      //     { role: 'user', content },
      //     {
      //       role: 'user',
      //       content: `Base your response on this: ${combinedPdfText}`,
      //     },
      //   ],
      //   model: 'gpt-4o',
      // })

      // return completion.choices[0]
      return 'ok'
    }

    const chatgptOutput = await call(content, combinedPdfText)
    const cid = await computeCid(combinedPdfText)
    res.status(200).json({ assistantResponse: chatgptOutput, combinedPdfText: combinedPdfText, cid })
  } catch (error: any) {
    console.error(`Handler error:`, error)
    res.status(500).json({ assistantResponse: `Error: ${error.message}`, combinedPdfText: '' })
  }
}

export default handler
