import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

const REQUEST_LIMIT = 3
const DAY_IN_MS = 24 * 60 * 60 * 1000

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ip_address = (req.headers['x-forwarded-for'] as string)?.split(',').shift() || req.socket.remoteAddress

  if (typeof ip_address !== 'string') {
    return res.status(400).json({ error: 'Invalid IP address' })
  }

  try {
    const twentyFourHoursAgo = Date.now() - DAY_IN_MS

    const { data: requestCounts, error } = await supabase
      .from('requests')
      .select('*', { count: 'exact' })
      .eq('ip_address', ip_address)
      .gt('created_at', new Date(twentyFourHoursAgo).toISOString())

    if (error) {
      throw error
    }

    const requestCount = requestCounts.length

    if (requestCount === 0) {
      console.log('No requests found within the last 24 hours')

      return res.status(200).json({ within24Hours: false })
    }

    if (requestCount >= REQUEST_LIMIT) {
      return res.status(200).json({ within24Hours: true })
    }

    await recordRequest(ip_address)

    return res.status(200).json({ within24Hours: false })
  } catch (error: any) {
    console.error('Error checking request limit:', error.message)
    res.status(500).json({ error: 'Failed to check request limit' })
  }
}

async function recordRequest(ip_address: string) {
  try {
    await supabase.from('requests').insert([{ ip_address }])
  } catch (error: any) {
    console.error('Error recording request:', error.message)
    throw error
  }
}
