import { useState, useEffect } from 'react'
import { Text, Button, useToast, Link, FormControl, FormLabel, Input } from '@chakra-ui/react'
import { HeadingComponent } from '../../components/layout/HeadingComponent'

export default function Sources() {
  const [pdfFiles, setPdfFiles] = useState<string[]>([])
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [userEmail, setUserEmail] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const formData = new FormData()
    formData.append('form-name', 'pdf-form')
    formData.append('pdfUrl', pdfUrl)
    formData.append('userEmail', userEmail)
    formData.append('userName', userName)

    try {
      const response = await fetch('/sources', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      toast({
        title: 'Merci pour votre contribution !',
        description: "L'ajout de ce document va maintenant faire l'objet d'un vote",
        status: 'success',
        duration: 12000,
        isClosable: true,
      })

      setPdfUrl('')
      setUserEmail('')
      setUserName('')
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

  return (
    <>
      <main>
        <HeadingComponent as={'h3'}>Les sources</HeadingComponent>
        <br />
        {pdfFiles.length > 0 ? (
          <ul>
            {pdfFiles.map((file, index) => (
              <li key={index} style={{ marginLeft: '20px', marginBottom: '10px' }}>
                <Link href={`./sources/${file}`} target="_blank" rel="noopener noreferrer" color={'#45a2f8'} _hover={{ color: '#8c1c84' }}>
                  {file}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Text>Loading...</Text>
        )}
        <br />
        <HeadingComponent as={'h3'}>Ajouter un document</HeadingComponent>

        <Text>
          Vous pouvez proposer d&apos;ajouter un document au corpus. Ce document doit être au format PDF et doit être accessible via une URL.
          L&apos;ajout fera l&apos;objet d&apos;un vote.
        </Text>

        <form name="pdf-form" method="POST" data-netlify="true" onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <input type="hidden" name="form-name" value="pdf-form" />
          <FormControl>
            <FormLabel htmlFor="pdfUrl">Lien vers le PDF</FormLabel>
            <Input
              id="pdfUrl"
              name="pdfUrl"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder="https://yvelines.eelv.fr/files/2024/06/240618-PROGRAMME-FRONT-POPULAIRE_V6.pdf"
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel htmlFor="userEmail">Votre adresse email</FormLabel>
            <Input
              id="userEmail"
              name="userEmail"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="francis@champion.com"
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel htmlFor="userName">Votre nom</FormLabel>
            <Input id="userName" name="userName" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Francis Champion" />
          </FormControl>
          <br />
          <Button mt={4} colorScheme="blue" type="submit">
            Submit
          </Button>
        </form>
        <br />
        <br />
        <br />
        <br />
      </main>
    </>
  )
}
