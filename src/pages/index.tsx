import * as React from 'react'
import { Text, Button, useToast, FormControl, Textarea, FormHelperText, Link } from '@chakra-ui/react'
import { useState } from 'react'
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

const customProvider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_ENDPOINT_URL)

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState(
    "Quelles sont les différences au sujet de l'éducation entre le programme du NFP, celui d'Ensemble, et celui du FN, s'il vous plaît ?"
  )
  const [corpusMatched, setCorpusMatched] = useState(false)
  const [data, setData] = useState<any>(null)
  const [dataFromSupabase, setDataFromSupabase] = useState<any>([])
  const toast = useToast()

  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })

  async function computeCid(data: any) {
    const helia = await createHelia()
    const s = strings(helia)
    const myImmutableAddress = await s.add(data)
    return myImmutableAddress.toString()
  }

  const fetchDataFromSupabase = async () => {
    const apiUrl = '/api/insert'
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch data from Supabase')
      }

      const data = await response.json()
      setDataFromSupabase(data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching data from Supabase:', error)
      toast({
        title: 'Woops',
        description: "Déso, j'ai eu un souci avec Supabase",
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      setIsLoading(false)
    }
  }

  const checkLimit = async () => {
    const apiUrl = '/api/checkLimit'
    try {
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

      if (data.within24Hours === true) {
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Error checking limit:', error)
      toast({
        title: 'Woops',
        description: "Désolé ! J'ai rencontré une erreur lors de la vérification de votre limite.",
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      setIsLoading(false)
      return false
    }
  }

  const verifyCorpus = async (result: any) => {
    try {
      if (result) {
        setData(result.message.content)

        const cid = await computeCid(corpus[0].combinedPdfText)

        const gov = new ethers.Contract(govContract.address, govContract.abi, customProvider)
        const corpusFromContract = await gov.corpus()

        if (cid === corpusFromContract) {
          setCorpusMatched(true)
        }
      }
    } catch (error) {
      console.error('Error in verifyCorpus:', error)
      toast({
        title: 'Erreur vérification',
        description: "Pardon ! J'ai rencontré une erreur pendant la vérification du corpus.",
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const callOpenAI = async (content: any) => {
    try {
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
              "Le NFP c'est le Nouveau Front Populaire (à ne pas confondre avec le FN). Le FN, c'est le RN, c'est-à-dire le Front National (renommé récemment 'Rassemblement National'). Renaissance = Horizons = Ensemble pour la République = Ensemble = Macron = Attal = majorité présidentielle",
          },
          { role: 'user', content },
          {
            role: 'user',
            content: `Base your response on this: ${corpus[0].combinedPdfText}`,
          },
        ],
        model: 'gpt-4-turbo',
      })

      await fetchDataFromSupabase()
      return completion.choices[0]
    } catch (error) {
      console.error('Error calling OpenAI:', error)
      toast({
        title: 'Mamma mia !',
        description: "J'ai eu un souci, merci de réessayer un peu plus tard.",
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      setIsLoading(false)
      return null
    }
  }

  const ask = async () => {
    setIsLoading(true)

    const limitCheckPassed = await checkLimit()

    console.log('limitCheckPassed:', limitCheckPassed)
    if (limitCheckPassed === true || limitCheckPassed === null) {
      setIsLoading(false)
      toast({
        title: 'Doucement !',
        description: "Vous avez déjà posé trois questions aujourd'hui. Réessayez demain !",
        status: 'warning',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    const result = await callOpenAI(input)
    await verifyCorpus(result)
  }

  const handleKeyDown = (event: any) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      ask()
    }
  }

  return (
    <>
      <Head title={SITE_NAME} description={SITE_DESCRIPTION} />
      <main>
        <FormControl>
          <HeadingComponent as="h3">Fatou sait tout !</HeadingComponent>
          <Text py={4} fontSize="16px">
            Vous pouvez poser 3 questions maximum par jour et par personne. Essayez par exemple de demander à Fatou de vous expliquer les différences
            de chaque programme sur tel ou tel sujet qui vous intéresse.
          </Text>
          <br />
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="" onKeyDown={handleKeyDown} />
          <FormHelperText>Demander ce que vous voulez à Fatou...</FormHelperText>
        </FormControl>

        <br />
        <Button
          colorScheme="blue"
          variant="outline"
          type="button"
          onClick={ask}
          isLoading={isLoading}
          loadingText="Fatou réfléchit..."
          spinnerPlacement="end">
          Demander à Fatou
        </Button>

        {data && (
          <>
            {corpusMatched && (
              <Link
                href={`https://github.com/julienbrg/legislatives/blob/1e5ce0c4df93ed33a48fe6086ba96aa443a4aa47/public/corpus.json#L4`}
                target="_blank"
                rel="noopener noreferrer"
                // color={'#45a2f8'}
                _hover={{ color: '#8c1c84' }}>
                <Text py={4} fontSize="12px">
                  <strong>Les sources ont été vérifiées. ✅</strong>
                </Text>
              </Link>
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
