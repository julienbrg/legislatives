import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { firstname, location, budget, action1, action2, action3 } = req.body

    const { error } = await supabase.from('programmes').insert([
      {
        firstname,
        location,
        budget,
        action1,
        action2,
        action3,
      },
    ])

    if (error) {
      throw error
    }

    res.status(201).json({ message: 'Data inserted successfully' })
  } catch (error: any) {
    console.error('Error inserting data into Supabase:', error.message)
    res.status(500).json({ error: 'Failed to insert data' })
  }
}
