import * as React from 'react'
import { Text, Button, useToast, FormControl, FormLabel, Textarea, FormHelperText } from '@chakra-ui/react'
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

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [input, setInput] = useState<string>('Quelle est la date de naissance de Martin Luther King?')
  const [output, setOutput] = useState<string>()
  const [data, setData] = useState<Data | null>(null)

  type Data = {
    name: string
  }

  const { address, chainId, isConnected } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
  const provider: Eip1193Provider | undefined = walletProvider
  const toast = useToast()

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
      setData(result.assistantResponse.message.content)
      setIsLoading(false)
    } catch (e: any) {
      console.log('error:', e)
      setIsLoading(false)
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
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="" />
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
        <br />

        {data && (
          <>
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
