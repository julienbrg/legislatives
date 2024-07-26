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
    const { firstname, location, budget, action1, action2, action3, wallet_address } = req.body

    // Check if the wallet address already exists
    const { data: existingEntries, error: fetchError } = await supabase
      .from('programmes')
      .select('wallet_address')
      .eq('wallet_address', wallet_address)

    if (fetchError) {
      throw fetchError
    }

    if (existingEntries && existingEntries.length > 0) {
      res.status(409).json({ error: 'Wallet address already used', code: 'WALLET_ALREADY_USED' })
      return
    }

    // Insert the new entry
    const { error: insertError } = await supabase.from('programmes').insert([
      {
        firstname,
        location,
        budget,
        action1,
        action2,
        action3,
        wallet_address,
      },
    ])

    if (insertError) {
      throw insertError
    }

    res.status(201).json({ message: 'Data inserted successfully' })
  } catch (error: any) {
    console.error('Error inserting data into Supabase:', error.message)
    res.status(500).json({ error: 'Failed to insert data' })
  }
}
