import * as React from 'react'
import { Text, Button, useToast, FormControl, Textarea, FormHelperText, Box } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { BrowserProvider, Contract, Eip1193Provider, parseEther } from 'ethers'
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react'
import { ERC20_CONTRACT_ADDRESS, ERC20_CONTRACT_ABI } from '../utils/erc20'
import { LinkComponent } from '../components/layout/LinkComponent'
import { HeadingComponent } from '../components/layout/HeadingComponent'
import { ethers } from 'ethers'
import { Head } from '../components/layout/Head'
import { SITE_NAME, SITE_DESCRIPTION } from '../utils/config'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import corpus from '../../public/corpus.json'

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [input, setInput] = useState<string>('Quelle est la date de naissance de Martin Luther King?')
  const [corpusMatched, setCorpusMatched] = useState<boolean>(false)
  const [data, setData] = useState<Data | null>(null)

  type Data = {
    name: string
  }

  const { address, chainId, isConnected } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
  const provider: Eip1193Provider | undefined = walletProvider
  const toast = useToast()

  // Compute the corpus from the /sources folder
  const computeCorpus = async () => {}

  // Compare the sources hashes
  const compareSourcesHashes = async () => {}

  // Compare the corpus hashes
  const compareCorpusHashes = async () => {}

  const call = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: input,
        }),
      })
      const result = await response.json()
      console.log('result:', result)
      // setData(result.assistantResponse.message.content)

      console.log('result.cid:', result.cid)
      console.log('corpus[0].cid:', corpus[0].cid)

      if (result.cid === corpus[0].cid) {
        setCorpusMatched(true)
      }

      setData(result.combinedPdfText)
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
