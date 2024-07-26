import { useState } from 'react'
import { FormControl, Text, Textarea, FormHelperText, FormLabel, Input, Button, useToast } from '@chakra-ui/react'
import { HeadingComponent } from '../../components/layout/HeadingComponent'

export default function Gouv() {
  const [isLoading, setIsLoading] = useState(false)
  const [budget, setBudget] = useState('')
  const [action1, setAction1] = useState('')
  const [action2, setAction2] = useState('')
  const [action3, setAction3] = useState('')
  const [firstname, setFirstname] = useState('')
  const [location, setLocation] = useState('')

  const toast = useToast()

  const handleSubmit = async () => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/gouvWrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstname,
          location,
          budget,
          action1,
          action2,
          action3,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit data')
      }

      const result = await response.json()
      console.log('Form submission result:', result)
      toast({
        title: 'Bien reçu ! 🎉',
        description: 'Merci pour votre précieuse contribution.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      setIsLoading(false)
    } catch (error) {
      console.error('Form submission error:', error)
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

  return (
    <main>
      <FormControl>
        <HeadingComponent as="h1">Mon programme</HeadingComponent>
        <Text py={4} fontSize="16px">
          Si vous étiez aujourd&apos;hui à la tête du gouvernement de la France, quelles seraient les <strong>dix premières mesures</strong> que vous
          prendriez ? Et quelle serait <strong>votre approche sur le budget de la France</strong> ?
        </Text>
        <br />

        <HeadingComponent as="h3">Budget</HeadingComponent>

        <FormLabel>Décrivez ce qui vous semble important à prendre en compte pour faire passer un budget équilibré :</FormLabel>
        <Textarea value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="" />
        <FormHelperText></FormHelperText>
        <br />
        <br />
        <HeadingComponent as="h3">Mesures</HeadingComponent>

        <Text fontSize="16px">Quelles sont les 10 mesures qui pourraient, selon vous, faire consensus au sein de l&apos;assemblée ?</Text>
        <br />
        <br />
        <FormLabel>Mesure 1</FormLabel>

        <Textarea value={action1} onChange={(e) => setAction1(e.target.value)} placeholder="" />
        <FormHelperText></FormHelperText>
        <br />
        <br />
        <FormLabel>Mesure 2</FormLabel>
        <Textarea value={action2} onChange={(e) => setAction2(e.target.value)} placeholder="" />
        <FormHelperText></FormHelperText>
        <br />
        <br />
        <FormLabel>Mesure 3</FormLabel>
        <Textarea value={action3} onChange={(e) => setAction3(e.target.value)} placeholder="" />
        <FormHelperText></FormHelperText>
        <br />
        <br />
        <FormLabel>Votre prénom</FormLabel>
        <Input value={firstname} onChange={(e: any) => setFirstname(e.target.value)} placeholder="" />
        <FormHelperText>Ces données sont publiques.</FormHelperText>
        <br />
        <FormLabel>Dans quel coin habitez-vous ?</FormLabel>
        <Input value={location} onChange={(e: any) => setLocation(e.target.value)} placeholder="" />
        <FormHelperText>Ces données sont publiques.</FormHelperText>
        <br />
        <br />
      </FormControl>
      <Button
        colorScheme="blue"
        variant="outline"
        type="button"
        onClick={handleSubmit}
        isLoading={isLoading}
        loadingText="Envoi en cours..."
        spinnerPlacement="end">
        Envoyer
      </Button>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
    </main>
  )
}
