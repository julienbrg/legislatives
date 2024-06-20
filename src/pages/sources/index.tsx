import { useState, useEffect } from 'react'
import { Text, Button, useToast, Link } from '@chakra-ui/react'
import { HeadingComponent } from '../../components/layout/HeadingComponent'

export default function Sources() {
  const [pdfFiles, setPdfFiles] = useState<string[]>([])
  const toast = useToast()

  useEffect(() => {
    const fetchPdfFiles = async () => {
      try {
        const response = await fetch('/api/list-pdfs')
        if (!response.ok) {
          throw new Error('Failed to fetch PDF files')
        }
        const data = await response.json()
        setPdfFiles(data.pdfFiles)
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message,
          status: 'error',
          duration: 9000,
          isClosable: true,
        })
      }
    }

    fetchPdfFiles()
  }, [toast])

  return (
    <>
      <main>
        <HeadingComponent as={'h3'}>Les sources</HeadingComponent>
        <br />
        {pdfFiles.length > 0 ? (
          <ul>
            {pdfFiles.map((file, index) => (
              <li key={index} style={{ marginLeft: '20px', marginBottom: '10px' }}>
                <li key={index} style={{ paddingLeft: '20px' }}>
                  <Link href={`./sources/${file}`} target="_blank" rel="noopener noreferrer" color={'#45a2f8'} _hover={{ color: '#8c1c84' }}>
                    {file}
                  </Link>
                </li>
              </li>
            ))}
          </ul>
        ) : (
          <Text>Aucun fichier PDF trouvé.</Text>
        )}
      </main>
    </>
  )
}
