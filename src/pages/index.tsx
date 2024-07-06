import * as React from 'react'
import { Text, Button, useToast, FormControl, Textarea, FormHelperText } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react'
import { HeadingComponent } from '../components/layout/HeadingComponent'
import { Head } from '../components/layout/Head'
import { SITE_NAME, SITE_DESCRIPTION } from '../utils/config'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import corpus from '../../public/corpus.json'
import OpenAI from 'openai'
import { createHelia } from 'helia'
import { strings } from '@helia/strings'
import { ethers } from 'ethers'
import govContract from '../utils/Gov.json'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/router'

const customProvider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_ENDPOINT_URL)

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [input, setInput] = useState<string>(
    "Quelles sont les différences au sujet de l'éducation entre le programme du NFP, celui d'Ensemble, et celui du FN, s'il vous plaît ?"
  )
  const [corpusMatched, setCorpusMatched] = useState<boolean>(false)
  const [data, setData] = useState<string | null>(null)
  const [dataFromSupabase, setDataFromSupabase] = useState<any[]>([])
  const { address, chainId, isConnected } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
  const toast = useToast()

  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  async function computeCid(data: string): Promise<string> {
    const helia = await createHelia()
    const s = strings(helia)
    const myImmutableAddress = await s.add(data)
    return myImmutableAddress.toString()
  }

  const fetchDataFromSupabase = async () => {
    const apiUrl = '/api/getData'
    try {
      setIsLoading(true)

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to add entry')
      }
    } catch (error) {
      console.error('Error adding entry:', error)
      toast({
        title: 'Oops',
        description: 'Failed to add entry',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  async function checkLimit() {
    const apiUrl = '/api/checkLimit'
    try {
      setIsLoading(true)

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to check limit')
      }

      const data = await response.json()

      if (!data.within24Hours) {
        return true
      } else {
        toast({
          title: 'Doucement, la mule !',
          description: "On ne peut poser qu'une seule question par jour à Fatou. Merci de ré-essayer demain.",
          status: 'warning',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Error checking limit:', error)
      toast({
        title: 'Oops',
        description: 'Failed to check limit',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function callOpenAI(content: string) {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: "Réponds systématiquement en français. Vovoie l'utilisateur." },
        {
          role: 'system',
          content:
            "Talk and answer as if you are Fatou, a young French woman. The additional text provided are Fatou's sources, so it should be referred to as 'my sources'. She will never express her own political opinion: she's here to help citizens make their choice. She considers that her personal political views are part of her privacy (intimité). She finds it important to go vote on June 30 and July 7. Instead of inviting people to go read the programs, she suggests asking another question.",
        },
        {
          role: 'system',
          content:
            "Le NFP c'est le Nouveau Front Populaire. Le FN, c'est le RN, c'est-à-dire le Front National (renommé récemment 'Rassemblement National'). Renaissance = Horizons = Ensemble pour la République = Ensemble = Macron = Attal = majorité présidentielle",
        },
        { role: 'user', content },
        {
          role: 'user',
          content: `Base your response on this: ${corpus[0].combinedPdfText}`,
        },
      ],
      model: 'gpt-3.5-turbo',
    })

    await fetchDataFromSupabase()
    return completion.choices[0]
  }

  const verifyCorpus = async () => {
    setIsLoading(true)

    const check = await checkLimit()

    if (check !== true) {
      setIsLoading(false)
      return
    }

    const result = await callOpenAI(input)
    console.log('result:', result)
    setData(result.message.content)

    try {
      const cid = await computeCid(corpus[0].combinedPdfText)

      const gov = new ethers.Contract(govContract.address, govContract.abi, customProvider)
      const corpusFromContract = await gov.corpus()

      if (cid === corpusFromContract) {
        setCorpusMatched(true)
      }
    } catch (error) {
      console.error('Error calling OpenAI or Ethereum smart contract:', error)
      toast({
        title: 'Oops',
        description: 'An error occurred while processing your request.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      verifyCorpus()
    }
  }

  return (
    <>
      <Head title={SITE_NAME} description={SITE_DESCRIPTION} />
      <main>
        <FormControl>
          <HeadingComponent as="h3">Fatou sait tout !</HeadingComponent>
          <br />
          <Textarea
            value={input}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
            placeholder=""
            onKeyDown={handleKeyDown}
          />
          <FormHelperText>Demander ce que vous voulez à Fatou...</FormHelperText>
        </FormControl>

        <br />
        <Button
          colorScheme="blue"
          variant="outline"
          type="button"
          onClick={verifyCorpus}
          isLoading={isLoading}
          loadingText="Fatou réfléchit..."
          spinnerPlacement="end">
          Demander à Fatou
        </Button>

        {data && (
          <>
            {corpusMatched && (
              <Text py={4} fontSize="12px">
                <strong>Les sources ont été vérifiées. ✅</strong>
              </Text>
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
              {data}
            </ReactMarkdown>
          </>
        )}
        {dataFromSupabase.length > 0 && (
          <Text py={4} fontSize="16px">
            {dataFromSupabase[0].payed}
          </Text>
        )}
      </main>
    </>
  )
}
