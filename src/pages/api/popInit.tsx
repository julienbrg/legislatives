import type { NextApiRequest, NextApiResponse } from 'next'

const popApiKey = process.env.NEXT_PUBLIC_POP_API_KEY || ''

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { address } = req.body

    const response = await fetch('https://api.pop.anima.io/v1/personhood/init', {
      method: 'POST',
      headers: {
        'Api-Key': popApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address }),
    })

    if (!response.ok) {
      throw new Error('Failed to initialize PoP session')
    }

    const result = await response.json()
    console.log(result)

    res.status(201).json({ message: 'Success', data: result })
  } catch (error: any) {
    console.error('Error initializing PoP:', error.message)
    res.status(500).json({ error: 'Error initializing PoP' })
  }
}
