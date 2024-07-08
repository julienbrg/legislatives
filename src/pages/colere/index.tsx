import { useState, useEffect } from 'react'
import { Box, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Alert, AlertIcon } from '@chakra-ui/react'
import { HeadingComponent } from '../../components/layout/HeadingComponent'

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
      <Alert status="warning" mb={4}>
        <AlertIcon />
        Attention : cette page n&apos;est pas prête.
      </Alert>

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
