import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

type Data = {
  pdfFiles: string[]
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const sourcesDir = path.join(process.cwd(), 'public', 'sources')
  const files = fs.readdirSync(sourcesDir)
  const pdfFiles = files.filter((file) => file.endsWith('.pdf'))
  res.status(200).json({ pdfFiles })
}
