import * as React from 'react'
import { Text, Button, useToast, FormControl, Textarea, FormHelperText, Box } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react'
import { LinkComponent } from '../components/layout/LinkComponent'
import { HeadingComponent } from '../components/layout/HeadingComponent'
import { Head } from '../components/layout/Head'
import { SITE_NAME, SITE_DESCRIPTION } from '../utils/config'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import corpus from '../../public/corpus.json'
import OpenAI from 'openai'
// import fetch from 'node-fetch'
// import pdfParse from 'pdf-parse'
// import fs from 'fs'
// import path from 'path'
import { createHelia } from 'helia'
import { strings } from '@helia/strings'

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [input, setInput] = useState<string>('Quelle est la date de naissance de Martin Luther King?')
  const [corpusMatched, setCorpusMatched] = useState<boolean>(false)
  const [data, setData] = useState<string | null>(null)

  const { address, chainId, isConnected } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
  const toast = useToast()

  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })

  async function computeCid(data: string): Promise<string> {
    const helia = await createHelia()
    const s = strings(helia)
    const myImmutableAddress = await s.add(data)
    return myImmutableAddress.toString()
  }

  // async function fetchAndExtractTextFromPDF(url: string): Promise<string> {
  //   const response = await fetch(url)
  //   if (!response.ok) {
  //     throw new Error(`Failed to fetch PDF file from ${url}`)
  //   }
  //   const arrayBuffer = await response.arrayBuffer()
  //   const buffer = Buffer.from(arrayBuffer)
  //   const data = await pdfParse(buffer)
  //   return data.text
  // }

  // async function fetchAllPDFTexts(baseUrl: string): Promise<string[]> {
  //   const sourcesDir = path.join(process.cwd(), 'public', 'sources')
  //   const files = fs.readdirSync(sourcesDir)
  //   const pdfFiles = files.filter((file) => file.endsWith('.pdf'))
  //   const pdfTexts: string[] = []

  //   for (const file of pdfFiles) {
  //     try {
  //       const pdfUrl = `${baseUrl}/sources/${file}`
  //       console.log('Fetching PDF from:', pdfUrl)
  //       const pdfText = await fetchAndExtractTextFromPDF(pdfUrl)
  //       pdfTexts.push(pdfText)
  //     } catch (error) {
  //       console.error(`Error processing file ${file}:`, error)
  //     }
  //   }

  //   return pdfTexts
  // }

  async function callOpenAI(content: string) {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: "Réponds systématiquement en français. Vovoie l'utilisateur" },
        {
          role: 'system',
          content:
            "Talk and answer as if you are Fatou, a young French woman. The additional text provided are Fatou's sources, so it should be referred to as 'my sources'. She will never express her own political opinion: she's here to help citizens make their choice. She considers that her personal political views are part of her privacy (intimité). She finds it important to go vote on June 30 and July 7. Instead of inviting people to go read the programs, she suggests asking another question.",
        },
        {
          role: 'system',
          content:
            "Le NFP c'est le Nouveau Front Populaire. Le FN, c'est le RN, c'est-à-dire le Front National (renommé récemment 'Rassemblement National')",
        },
        { role: 'user', content },
        {
          role: 'user',
          content: `Base your response on this: ${corpus[0].combinedPdfText}`,
        },
      ],
      model: 'gpt-4-turbo',
    })

    return completion.choices[0]
  }

  const call = async () => {
    try {
      setIsLoading(true)

      // Get the base URL dynamically
      const protocol = window.location.protocol
      const host = window.location.host
      const baseUrl = `${protocol}//${host}`

      // const pdfTexts = await fetchAllPDFTexts(baseUrl)
      // const combinedPdfText = pdfTexts.join('\n\n')

      const result = await callOpenAI(input)
      console.log('result:', result)
      setData(result.message.content)

      // Check if CID matches
      const cid = await computeCid(corpus[0].combinedPdfText)
      console.log('result.cid:', cid)
      // console.log('corpus[0].cid:', corpus[0].cid)

      // TODO: get from onchain contract instead
      if (cid === 'bafkreibkk43dhpyefvsckcwzprmebi3ied7aemic64gzj3dniakpxux7ja') {
        setCorpusMatched(true)
      }
      setIsLoading(false)
    } catch (e: any) {
      console.log('error:', e)
      setIsLoading(false)
      toast({
        title: 'Woops',
        description: "Mille excuses, j'ai eu un souci ! Je vous invite à reposer votre question, s'il vous plaît.",
        status: 'error',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        call()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [input])

  return (
    <>
      <Head title={SITE_NAME} description={SITE_DESCRIPTION} />
      <main>
        <FormControl>
          <HeadingComponent as={'h3'}>Fatou sait tout !</HeadingComponent>
          <br />
          <Textarea value={input} onChange={(e: any) => setInput(e.target.value)} placeholder="" />
          <FormHelperText>Demander ce que vous voulez à Fatou...</FormHelperText>
        </FormControl>

        <br />
        <Button
          colorScheme="blue"
          variant="outline"
          type="submit"
          onClick={call}
          isLoading={isLoading}
          loadingText="Fatou réfléchit..."
          spinnerPlacement="end">
          Demander à Fatou
        </Button>

        {data && (
          <>
            {corpusMatched && (
              <LinkComponent href={'./sources'}>
                <Text py={4} fontSize="12px">
                  <strong>Les sources ont été vérifiées. ✅</strong>
                </Text>
              </LinkComponent>
            )}
            <Text py={4} fontSize="16px">
              <strong>Fatou dit:</strong>
            </Text>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ node, ...props }) => <p style={{ marginBottom: '16px' }} {...props} />,
                li: ({ node, ...props }) => <li style={{ marginLeft: '20px', marginBottom: '10px' }} {...props} />,
              }}>
              {String(data)}
            </ReactMarkdown>
          </>
        )}
      </main>
    </>
  )
}
