import { useState, useEffect } from 'react'
import { FormControl, Text, Textarea, FormHelperText, FormLabel, Input, Button, useToast, Box } from '@chakra-ui/react'
import { HeadingComponent } from '../../components/layout/HeadingComponent'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Programme {
  id: number
  firstname: string
  location: string
  budget: string
  action1: string
  action2: string
  action3: string
  created_at: string
}

export default function Gouv() {
  const [isLoading, setIsLoading] = useState(false)
  const [budget, setBudget] = useState('')
  const [action1, setAction1] = useState('')
  const [action2, setAction2] = useState('')
  const [action3, setAction3] = useState('')
  const [firstname, setFirstname] = useState('')
  const [location, setLocation] = useState('')
  const [programmes, setProgrammes] = useState<Programme[]>([])
  const [limit, setLimit] = useState(10)
  const toast = useToast()

  const fetchProgrammes = async (limit: number) => {
    try {
      const response = await fetch(`/api/gouvRead?limit=${limit}`)
      const data = await response.json()
      setProgrammes(data)
    } catch (error) {
      console.error('Error fetching programmes:', error)
      toast({
        title: 'Woops',
        description: "Déso, on n'a pas réussi à charger les données sur cette page.",
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  useEffect(() => {
    fetchProgrammes(limit)
  }, [limit])

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
        duration: 9000,
        isClosable: true,
      })
      setIsLoading(false)
      fetchProgrammes(limit) // Fetch updated programmes list
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

  const maxLength = 500

  return (
    <main>
      <FormControl>
        <HeadingComponent as="h1">Mon programme</HeadingComponent>
        <Text py={4} fontSize="16px">
          Si vous étiez aujourd&apos;hui à la tête du gouvernement de la France, quelles seraient les <strong>dix premières mesures</strong> que vous
          prendriez ? Et quelle serait <strong>votre approche sur le budget de la France</strong> ?
        </Text>
        <Text fontSize="16px" color="red" fontWeight="bold">
          Prenez votre temps : il n&apos;y a qu&apos;une seule réponse possible par personne.
        </Text>
        <br />
        <br />

        <HeadingComponent as="h3">Budget</HeadingComponent>

        <FormLabel>Décrivez ce qui vous semble important à prendre en compte pour faire passer un budget équilibré :</FormLabel>
        <Textarea value={budget} onChange={(e) => setBudget(e.target.value)} isInvalid={budget.length > maxLength} placeholder="" />
        <FormHelperText>
          {budget.length}/{maxLength}
        </FormHelperText>
        <br />
        <br />
        <HeadingComponent as="h3">Mesures</HeadingComponent>

        <Text fontSize="16px">Quelles sont les 10 mesures qui pourraient, selon vous, faire consensus au sein de l&apos;assemblée ?</Text>
        <br />
        <br />
        <FormLabel>Mesure 1</FormLabel>

        <Textarea value={action1} onChange={(e) => setAction1(e.target.value)} isInvalid={action1.length > maxLength} placeholder="" />
        <FormHelperText>
          {action1.length}/{maxLength}
        </FormHelperText>
        <br />
        <br />
        <FormLabel>Mesure 2</FormLabel>
        <Textarea value={action2} onChange={(e) => setAction2(e.target.value)} isInvalid={action2.length > maxLength} placeholder="" />
        <FormHelperText>
          {action2.length}/{maxLength}
        </FormHelperText>
        <br />
        <br />
        <FormLabel>Mesure 3</FormLabel>
        <Textarea value={action3} onChange={(e) => setAction3(e.target.value)} isInvalid={action3.length > maxLength} placeholder="" />
        <FormHelperText>
          {action3.length}/{maxLength}
        </FormHelperText>
        <br />
        <br />
        <FormLabel>Votre prénom</FormLabel>
        <Input value={firstname} onChange={(e: any) => setFirstname(e.target.value)} isInvalid={firstname.length > maxLength} placeholder="" />
        <FormHelperText>
          {firstname.length}/{maxLength}
        </FormHelperText>
        <br />
        <FormLabel>Dans quel coin habitez-vous ?</FormLabel>
        <Input value={location} onChange={(e: any) => setLocation(e.target.value)} isInvalid={location.length > maxLength} placeholder="" />
        <FormHelperText>
          {location.length}/{maxLength}
        </FormHelperText>
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

      <Box mt={8}>
        <HeadingComponent as="h2">Les réponses</HeadingComponent>
        <br />
        {programmes.map((programme, index) => (
          <Box key={index} p={4} borderWidth="1px" borderRadius="lg" overflow="hidden" mb={4}>
            <Text>
              <i>
                Le {format(new Date(programme.created_at), 'd MMMM yyyy', { locale: fr })},{' '}
                <strong>{programme.firstname ? programme.firstname : 'Anon'}</strong> de {programme.location ? programme.location : 'quelque part'} a
                écrit :
              </i>
            </Text>
            <br />
            {programme.budget && (
              <>
                <HeadingComponent as="h5">Budget</HeadingComponent>
                <Text>{programme.budget}</Text>
                <br />
              </>
            )}
            {programme.action1 && (
              <>
                <HeadingComponent as="h6">Mesure 1 :</HeadingComponent>
                <Text>{programme.action1}</Text>
                <br />
              </>
            )}
            {programme.action2 && (
              <>
                <HeadingComponent as="h6">Mesure 2 :</HeadingComponent>
                <Text>{programme.action2}</Text>
                <br />
              </>
            )}
            {programme.action3 && (
              <>
                <HeadingComponent as="h6">Mesure 3 :</HeadingComponent>
                <Text>{programme.action3}</Text>
                <br />
              </>
            )}
          </Box>
        ))}
        <br />
        {programmes.length >= limit && (
          <Button onClick={() => setLimit(limit + 10)} colorScheme="green" size={'sm'}>
            Voir plus de réponses
          </Button>
        )}
      </Box>
      <br />
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
