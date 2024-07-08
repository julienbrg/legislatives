import { useState, useEffect } from 'react'
import { FormControl, Text, Textarea, FormHelperText, Alert, AlertIcon, FormLabel, Input } from '@chakra-ui/react'
import { HeadingComponent } from '../../components/layout/HeadingComponent'

export default function MonVote() {
  const [vote, setVote] = useState("J'ai voté pour le candidat du NFP.")
  const [circo, setCirco] = useState('1ère circonscription de Marseille')
  const [explication, setExplication] = useState("J'aurais bien aimé...")
  const [pseudo, setPseudo] = useState('Batman')

  useEffect(() => {
    const fetchData = async () => {
      try {
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <main>
      <Alert status="warning" mb={4}>
        <AlertIcon />
        Attention : cette page n&apos;est pas prête.
      </Alert>
      <FormControl>
        <HeadingComponent as="h3">Explication de vote</HeadingComponent>
        <Text py={4} fontSize="16px"></Text>
        <br />
        <FormLabel>Où avez-vous voté ?</FormLabel>
        <Input value={circo} onChange={(e: any) => setCirco(e.target.value)} placeholder="" />
        <FormHelperText>Quelle circonscription ?</FormHelperText>
        <br />
        <FormLabel>Qu&apos;avez-vous voté ?</FormLabel>
        <Textarea value={vote} onChange={(e) => setVote(e.target.value)} placeholder="" />
        <FormHelperText>Quel candidat avez-vous choisi ?</FormHelperText>
        <br />
        <FormLabel>Quelles réformes auriez-vous le plus souhaité ?</FormLabel>
        <Textarea value={explication} onChange={(e) => setExplication(e.target.value)} placeholder="" />
        <FormHelperText></FormHelperText>
        <br />
        <FormLabel>Pseudo</FormLabel>
        <Input value={pseudo} onChange={(e: any) => setPseudo(e.target.value)} placeholder="" />
        <FormHelperText>Les données sont anonymisées</FormHelperText>
      </FormControl>
    </main>
  )
}
