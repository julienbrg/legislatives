import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

type Data = {
  assistantResponse: any
}

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    const call = async () => {
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'system', content: 'Martin Luther King birth date, please.' }],
        model: 'gpt-4',
      })

      return completion.choices[0]
    }

    const bonus = await call()
    res.status(200).json({ assistantResponse: bonus })
  } catch (error: any) {
    res.status(500).json({ assistantResponse: `Error: ${error.message}` })
  }
}

export default handler
