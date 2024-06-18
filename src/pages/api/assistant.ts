import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

type Data = {
  assistantResponse: any
}

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
const openai = new OpenAI({ apiKey })

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
    const call = async (content: string) => {
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'system', content }],
        model: 'gpt-4',
      })

      return completion.choices[0]
    }

    const bonus = await call(content)
    res.status(200).json({ assistantResponse: bonus })
  } catch (error: any) {
    res.status(500).json({ assistantResponse: `Error: ${error.message}` })
  }
}

export default handler
