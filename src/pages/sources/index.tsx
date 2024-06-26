import { useState, useEffect } from 'react'
import { Text, Button, useToast, Link, FormControl, FormLabel, Input } from '@chakra-ui/react'
import { HeadingComponent } from '../../components/layout/HeadingComponent'
import corpus from '../../../public/corpus.json'

export default function Sources() {
  const [pdfFiles, setPdfFiles] = useState<string[]>(corpus[0].files)
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [userEmail, setUserEmail] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [timestampFrench, setTimestampFrench] = useState<string>('')

  const toast = useToast()

  const cid = corpus[0].cid

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
      .format(date)
      .replace(',', ' à')
      .replace(':', 'h')
  }

  useEffect(() => {
    setTimestampFrench(formatTimestamp(corpus[0].timestamp))
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const formData = new FormData(event.target as HTMLFormElement)

    try {
      const response = await fetch('/', {
        method: 'POST',
        body: formData,
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
        <HeadingComponent as={'h5'}>Hash IPFS</HeadingComponent>

        <br />
        <Text>
          Le hash IPFS (ou CID) est l&apos;empreinte numérique de l&apos;ensemble des textes extraits de chaque document situés dans le dossier{' '}
          <Link
            href={`https://github.com/julienbrg/legislatives/blob/1e5ce0c4df93ed33a48fe6086ba96aa443a4aa47/public/corpus.json#L4`}
            target="_blank"
            rel="noopener noreferrer"
            color={'#45a2f8'}
            _hover={{ color: '#8c1c84' }}>
            &quot;sources&quot;
          </Link>
          . Ce dossier a été mis à jour <strong>le {timestampFrench}</strong>.
        </Text>
        <br />
        <Text>
          CID actuel:{' '}
          <Link
            href={`https://github.com/julienbrg/legislatives/blob/1e5ce0c4df93ed33a48fe6086ba96aa443a4aa47/public/corpus.json#L4`}
            target="_blank"
            rel="noopener noreferrer"
            color={'#45a2f8'}
            _hover={{ color: '#8c1c84' }}>
            <strong>{cid}</strong>
          </Link>
        </Text>
        <br />
        <Text>Chacun des documents présents dans les sources ont été vérifiés par:</Text>
        <br />
        <ul>
          <li style={{ marginLeft: '20px', marginBottom: '10px' }}>
            <Link href={`https://julienberanger.com`} target="_blank" rel="noopener noreferrer" color={'#45a2f8'} _hover={{ color: '#8c1c84' }}>
              Julien Béranger
            </Link>
          </li>
        </ul>
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
              placeholder="https://supersources.fr/Liste-des-candidats-en-Ile-de-France.pdf"
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
