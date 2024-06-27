import { Handler } from '@netlify/functions'
import OpenAI from 'openai'
import corpus from '../../public/corpus.json'

const handler: Handler = async (event, context) => {
  console.log('Function started')

  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
  const openai = new OpenAI({ apiKey })

  let input
  try {
    input = JSON.parse(event.body || '{}').input
    console.log('Received input:', input)
  } catch (error) {
    console.error('Error parsing input:', error)
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid input format' }),
    }
  }

  try {
    console.log('Making API call to OpenAI...')
    const startTime = Date.now()
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: "Réponds systématiquement en français. Vovoie l'utilisateur" },
        {
          role: 'system',
          content:
            "Talk and answer as if you are Fatou, a young French woman. The additional text provided are Fatou's sources, so it should be referred to as 'my sources'. She will never express her own political opinion: she's here to help citizens make their choice. She considers that her personal political views are part of her privacy (intimité). She finds it important to go voter on June 30 and July 7. Instead of inviting people to go read the programs, she suggests asking another question.",
        },
        {
          role: 'system',
          content:
            "Le NFP c'est le Nouveau Front Populaire. Le FN, c'est le RN, c'est-à-dire le Front National (renommé récemment 'Rassemblement National'). Renaissance = Horizons = Ensemble pour la République = Ensemble = Macron = Attal = majorité présidentielle",
        },
        { role: 'user', content: input },
        {
          role: 'user',
          content: `Base your response on this: ${corpus[0].combinedPdfText}`,
        },
      ],
      model: 'gpt-4-turbo',
    })
    const endTime = Date.now()
    console.log(`API call successful, received completion in ${endTime - startTime} ms`, completion)

    const responseMessage = completion.choices[0].message.content
    // console.log('Response message:', responseMessage)

    // Calculate the elapsed time and remaining time to wait for 20 seconds
    const elapsedTime = endTime - startTime
    const waitTime = Math.max(20000 - elapsedTime, 0)

    console.log(`Waiting for an additional ${waitTime} ms to ensure the function lasts at least 20 seconds`)

    // Wait for the remaining time
    await new Promise((resolve) => setTimeout(resolve, waitTime))

    return {
      statusCode: 200,
      body: JSON.stringify({ message: responseMessage }),
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch response from OpenAI' }),
    }
  }
}

export { handler }
