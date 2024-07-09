import { useState, useEffect } from 'react'
import { FormControl, Text, Textarea, FormHelperText, Alert, AlertIcon, FormLabel, Input, Box } from '@chakra-ui/react'
import { HeadingComponent } from '../../components/layout/HeadingComponent'
import { WarningIcon } from '@chakra-ui/icons'

export default function MonVote() {
  const [vote, setVote] = useState('')
  const [circo, setCirco] = useState('')
  const [explication, setExplication] = useState('')
  const [pseudo, setPseudo] = useState('')

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
      <Box borderWidth="3px" borderStyle="solid" borderColor="red.500" p={4} borderRadius="xl" mb={7} display="flex" alignItems="center">
        <WarningIcon color="red.500" mr={3} />
        <Text fontWeight="bold">Attention : cette page n&apos;est pas prête.</Text>
      </Box>
      <FormControl>
        <HeadingComponent as="h3">Explication de vote</HeadingComponent>
        <Text py={4} fontSize="16px"></Text>
        <br />
        <FormLabel>Où avez-vous voté ?</FormLabel>
        <Input value={circo} onChange={(e: any) => setCirco(e.target.value)} placeholder="" />
        <FormHelperText>Quelle circonscription ?</FormHelperText>
        <br />
        <br />
        <FormLabel>Pour qui avez-vous voté ?</FormLabel>
        <Textarea value={vote} onChange={(e) => setVote(e.target.value)} placeholder="" />
        <FormHelperText>Quel est le nom du candidat ou du parti pour qui vous avez voté ?</FormHelperText>
        <br />
        <br />
        <FormLabel>Quelles réformes auriez-vous le plus souhaité ?</FormLabel>
        <Textarea value={explication} onChange={(e) => setExplication(e.target.value)} placeholder="" />
        <FormHelperText></FormHelperText>
        <br />
        <br />
        <FormLabel>Votre pseudo</FormLabel>
        <Input value={pseudo} onChange={(e: any) => setPseudo(e.target.value)} placeholder="" />
        <FormHelperText>Les données sont anonymisées. Merci d&apos;indiquer un pseudo.</FormHelperText>
      </FormControl>
      <br />
      <br />
      <br />
      <br />
    </main>
  )
}
