import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress

  if (typeof ip_address !== 'string') {
    return res.status(400).json({ error: 'Invalid IP address' })
  }

  try {
    const { data, error } = await supabase
      .from('requests')
      .select('created_at')
      .eq('ip_address', ip_address)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      throw error
    }

    if (data.length === 0) {
      return res.status(200).json({ within24Hours: false })
    }

    const latestTimestamp = new Date(data[0].created_at).getTime()
    const currentTimestamp = Date.now()

    const hoursDifference = (currentTimestamp - latestTimestamp) / (1000 * 60 * 60)

    const within24Hours = hoursDifference <= 24

    res.status(200).json({ within24Hours })
  } catch (error: any) {
    console.error('Error checking login limit:', error.message)
    res.status(500).json({ error: 'Failed to check login limit' })
  }
}
