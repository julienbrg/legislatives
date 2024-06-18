import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import fetch from 'node-fetch'
import pdfParse from 'pdf-parse'

type Data = {
  assistantResponse: any
}

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
const openai = new OpenAI({ apiKey })

async function fetchAndExtractTextFromPDF(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch PDF file')
  }
  const buffer = await response.buffer()
  const data = await pdfParse(buffer)
  return data.text
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
    const pdfUrl = 'http://localhost:3000/sources/LHumanite-presente-le-programme-du-Nouveau-Front-Populaire.pdf' // Update with your actual file name
    const pdfText = await fetchAndExtractTextFromPDF(pdfUrl)

    console.log('pdfText:', pdfText)

    const call = async (content: string, pdfText: string) => {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content },
          { role: 'user', content: `Here is some additional context from a PDF document: ${pdfText}` },
        ],
        model: 'gpt-4o',
      })

      return completion.choices[0]
    }

    const bonus = await call(content, pdfText)
    res.status(200).json({ assistantResponse: bonus })
  } catch (error: any) {
    res.status(500).json({ assistantResponse: `Error: ${error.message}` })
  }
}

export default handler
