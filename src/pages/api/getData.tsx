import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const ip_address = (req.headers['x-forwarded-for'] as string)?.split(',').shift() || req.socket.remoteAddress
    const { data, error } = await supabase.from('requests').insert([{ ip_address }])

    if (error) {
      throw error
    }

    console.log('Inserted data:', data)
    res.status(201).json({ message: 'Data inserted successfully' })
  } catch (error: any) {
    console.error('Error inserting data into Supabase:', error.message)
    res.status(500).json({ error: 'Failed to insert data' })
  }
}
