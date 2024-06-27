import * as React from 'react'
import { Text, Button, useToast, FormControl, Textarea, FormHelperText } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react'
import { LinkComponent } from '../components/layout/LinkComponent'
import { HeadingComponent } from '../components/layout/HeadingComponent'
import { Head } from '../components/layout/Head'
import { SITE_NAME, SITE_DESCRIPTION } from '../utils/config'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import corpus from '../../public/corpus.json'
import { createHelia } from 'helia'
import { strings } from '@helia/strings'

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [input, setInput] = useState<string>(
    "Quelle sont les differences au sujet de l'éducation entre le programme du NFP, celui de Ensemble, et celui du FN, s'il te plaît ?"
  )
  const [corpusMatched, setCorpusMatched] = useState<boolean>(false)
  const [data, setData] = useState<string | null>(null)

  const { address, chainId, isConnected } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
  const toast = useToast()

  async function computeCid(data: string): Promise<string> {
    const helia = await createHelia()
    const s = strings(helia)
    const myImmutableAddress = await s.add(data)
    return myImmutableAddress.toString()
  }

  async function callAssistantAPI(input: string) {
    const response = await fetch('/.netlify/functions/assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch response from assistant API')
    }

    const data = await response.json()
    return data.message
  }

  const call = async () => {
    try {
      setIsLoading(true)

      const result = await callAssistantAPI(input)
      console.log('result:', result)
      setData(result)

      // Check if CID matches
      const cid = await computeCid(corpus[0].combinedPdfText)
      console.log('result.cid:', cid)
      // console.log('corpus[0].cid:', corpus[0].cid);

      // TODO: get from onchain contract instead
      if (cid === 'bafkreigeqjzxysmhc6tue7vaj27r7lqmkhhpcysowf4an46tlp6pouu6ia') {
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
        <br />
        <br />
        <br />
        <br />
      </main>
    </>
  )
}
