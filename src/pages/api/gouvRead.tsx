import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data, error } = await supabase.from('programmes').select('*').order('id', { ascending: false })

    if (error) {
      throw error
    }

    res.status(200).json(data)
  } catch (error: any) {
    console.error('Error fetching data from Supabase:', error.message)
    res.status(500).json({ error: 'Failed to fetch data' })
  }
}
