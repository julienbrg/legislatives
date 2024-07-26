import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const popApiKey = process.env.NEXT_PUBLIC_POP_API_KEY || ''

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const config = {
      method: 'post',
      url: 'https://api.pop.anima.io/v1/personhood/init',
      headers: {
        'Api-Key': popApiKey,
      },
    }

    const response = await axios(config)
    const result = response.data

    console.log(result)

    res.status(201).json({ message: 'Success', data: result })
  } catch (error: any) {
    console.error('Error initializing PoP:', error.message)
    res.status(500).json({ error: 'Error initializing PoP' })
  }
}
