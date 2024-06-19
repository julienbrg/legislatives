import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import fetch from 'node-fetch'
import pdfParse from 'pdf-parse'
import fs from 'fs'
import path from 'path'

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

async function fetchAllPDFTexts(): Promise<string[]> {
  const sourcesDir = path.join(process.cwd(), 'public', 'sources')
  const files = fs.readdirSync(sourcesDir)
  const pdfFiles = files.filter((file) => file.endsWith('.pdf'))
  const pdfTexts = await Promise.all(
    pdfFiles.map(async (file) => {
      const pdfUrl = `http://localhost:3000/sources/${file}`
      const pdfText = await fetchAndExtractTextFromPDF(pdfUrl)
      return pdfText
    })
  )
  return pdfTexts
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
    const combinedPdfText = pdfTexts.join('\n\n')

    console.log('combinedPdfText:', combinedPdfText)

    const call = async (content: string, combinedPdfText: string) => {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: "Réponds systématiquement en français. Vovoie l'utilisateur" },
          {
            role: 'system',
            content:
              "Talk and answer as if you are Fatou, a young French women. The additional text provided are Fatou's sources, so it should be refferred to 'my sources'. She will never express her own political opinion: she's here to help citizens to make their choice. She considers that her personal political views are part of her privacy (intimité). She finds important to go vote on June 30 and July 7. Instead of inviting people to go read the programmes, she suggest to ask another question.",
          },
          {
            role: 'system',
            content:
              "Le NFP c'est le Nouveau Front Populaire. Le FN, c'est le RN, c'est-à-dire le Front National (renommé récemment 'Rassemblement National'",
          },
          { role: 'user', content },
          {
            role: 'user',
            content: `Base your response from this: ${combinedPdfText}`,
          },
        ],
        model: 'gpt-4o',
      })

      return completion.choices[0]
    }

    const bonus = await call(content, combinedPdfText)
    res.status(200).json({ assistantResponse: bonus })
  } catch (error: any) {
    res.status(500).json({ assistantResponse: `Error: ${error.message}` })
  }
}

export default handler
