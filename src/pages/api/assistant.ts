import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import fetch from 'node-fetch'
import pdfParse from 'pdf-parse'
import fs from 'fs'
import path from 'path'
import cheerio from 'cheerio'
import references from '../../../public/sources/references.json'

type Data = {
  assistantResponse: any
}

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
const openai = new OpenAI({ apiKey })
const baseUrl = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://legislatives.fun'

async function fetchAndExtractTextFromPDF(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch PDF file')
  }
  const buffer = await response.buffer()
  const data = await pdfParse(buffer)
  return data.text
}

async function fetchAndExtractTextFromHTML(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch HTML page')
  }
  const html = await response.text()
  const $ = cheerio.load(html)
  const text = $('body').text()
  return text
}

async function fetchAllPDFTexts(): Promise<string[]> {
  const sourcesDir = path.join(process.cwd(), 'public', 'sources')
  const files = fs.readdirSync(sourcesDir)
  const pdfFiles = files.filter((file) => file.endsWith('.pdf'))
  const pdfTexts = await Promise.all(
    pdfFiles.map(async (file) => {
      const pdfUrl = `${baseUrl}/sources/${file}`
      const pdfText = await fetchAndExtractTextFromPDF(pdfUrl)
      return pdfText
    })
  )
  return pdfTexts
}

async function fetchAllHTMLTexts(): Promise<string[]> {
  const htmlTexts = await Promise.all(
    references.map(async (url) => {
      const htmlText = await fetchAndExtractTextFromHTML(url)
      return htmlText
    })
  )
  return htmlTexts
}

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    res.status(405).json({ assistantResponse: 'Method not allowed' })
    return
  }

  const { content } = req.body

  if (!content) {
    res.status(400).json({ assistantResponse: 'Content is required' })
    return
  }

  try {
    const pdfTexts = await fetchAllPDFTexts()
    const htmlTexts = await fetchAllHTMLTexts()
    const combinedPdfText = pdfTexts.join('\n\n')
    const combinedHtmlText = htmlTexts.join('\n\n')
    const combinedText = `${combinedPdfText}\n\n${combinedHtmlText}`

    const call = async (content: string, additionalContext: string) => {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: 'Réponds-moi toujours en français.' },
          { role: 'user', content },
          { role: 'user', content: `Here is some additional context from several documents: ${additionalContext}` },
        ],
        model: 'gpt-4o',
      })

      return completion.choices[0]
    }

    const bonus = await call(content, combinedText)
    res.status(200).json({ assistantResponse: bonus })
  } catch (error: any) {
    res.status(500).json({ assistantResponse: `Error: ${error.message}` })
  }
}

export default handler
