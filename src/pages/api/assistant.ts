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
const baseUrl = 'https://legislatives.fun'

async function fetchAndExtractTextFromPDF(url: string): Promise<string> {
  try {
    console.log(`Fetching PDF: ${url}`)
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch PDF file')
    }
    const buffer = await response.buffer()
    const data = await pdfParse(buffer)
    return data.text
  } catch (error) {
    console.error(`Error fetching PDF from ${url}:`, error)
    throw error
  }
}

async function fetchAndExtractTextFromHTML(url: string): Promise<string> {
  try {
    console.log(`Fetching HTML: ${url}`)
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch HTML page')
    }
    const html = await response.text()
    const $ = cheerio.load(html)
    const text = $('body').text()
    return text
  } catch (error) {
    console.error(`Error fetching HTML from ${url}:`, error)
    throw error
  }
}

async function fetchAllPDFTexts(): Promise<string[]> {
  try {
    const sourcesDir = path.join(process.cwd(), 'public', 'sources')
    const files = fs.readdirSync(sourcesDir)
    const pdfFiles = files.filter((file) => file.endsWith('.pdf'))
    const pdfTexts = await Promise.all(
      pdfFiles.map(async (file) => {
        const pdfUrl = `${baseUrl}/sources/${file}`
        return await fetchAndExtractTextFromPDF(pdfUrl)
      })
    )
    return pdfTexts
  } catch (error) {
    console.error('Error fetching all PDF texts:', error)
    throw error
  }
}

async function fetchAllHTMLTexts(): Promise<string[]> {
  try {
    const htmlTexts = await Promise.all(
      references.map(async (url) => {
        return await fetchAndExtractTextFromHTML(url)
      })
    )
    return htmlTexts
  } catch (error) {
    console.error('Error fetching all HTML texts:', error)
    throw error
  }
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
    console.log('Starting to fetch PDF and HTML texts')
    const [pdfTexts, htmlTexts] = await Promise.all([fetchAllPDFTexts(), fetchAllHTMLTexts()])
    const combinedPdfText = pdfTexts.join('\n\n')
    const combinedHtmlText = htmlTexts.join('\n\n')
    const combinedText = `${combinedPdfText}\n\n${combinedHtmlText}`

    console.log('Combined text length:', combinedText.length)

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'Réponds-moi toujours en français.' },
        { role: 'user', content },
        { role: 'user', content: `Here is some additional context from several documents: ${combinedText}` },
      ],
      model: 'gpt-4o',
    })

    res.status(200).json({ assistantResponse: completion.choices[0] })
  } catch (error: any) {
    console.error('Error in handler:', error)
    res.status(500).json({ assistantResponse: `Error: ${error.message}` })
  }
}

export default handler
