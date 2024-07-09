import { useState, useEffect } from 'react'
import { Box, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Alert, AlertIcon, Text } from '@chakra-ui/react'
import { HeadingComponent } from '../../components/layout/HeadingComponent'
import { WarningIcon } from '@chakra-ui/icons'

interface Quote {
  quote: string
  reply: string
}

export default function Colere() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [currentPage, setCurrentPage] = useState<number | undefined>(undefined)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('../../../colere.json')
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data = await response.json()
        setQuotes(data)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  const handleAccordionClick = (index: number) => {
    if (currentPage === index) {
      setCurrentPage(undefined)
    } else {
      setCurrentPage(index)
    }
  }

  return (
    <main>
      <Box borderWidth="3px" borderStyle="solid" borderColor="red.500" p={4} borderRadius="xl" mb={7} display="flex" alignItems="center">
        <WarningIcon color="red.500" mr={3} />
        <Text fontWeight="bold">Attention : cette page n&apos;est pas prête.</Text>
      </Box>

      <Accordion allowToggle defaultIndex={currentPage} allowMultiple>
        {quotes.map((quote, index) => (
          <AccordionItem key={index}>
            <h2>
              <AccordionButton onClick={() => handleAccordionClick(index)} justifyContent="space-between" width="100%">
                <Box as="span" flex="1" textAlign="left">
                  <HeadingComponent as={'h4'}>{quote.quote}</HeadingComponent>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel>
              <Box>{quote.reply}</Box>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </main>
  )
}
