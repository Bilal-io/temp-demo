import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set headers for streaming response
  res.setHeader('Transfer-Encoding', 'chunked')
  
  try {
    // Fetch from local TTS endpoint
    const response = await fetch('https://wwwqaz1.brainshark.com/brainshark/brainshark.services.coaching/tts', { method: 'GET' })

    // Ensure response is streaming
    if (!response.body) {
      throw new Error('No response body')
    }

    // Create a reader to handle streaming
    const reader = response.body.getReader()
    
    // Stream chunks back to client
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break
      
      // Write chunk to client response
      res.write(value)
    }

    // End the response
    res.end()
  } catch (error) {
    console.error('TTS Streaming Error:', error)
    res.status(500).end()
  }
}