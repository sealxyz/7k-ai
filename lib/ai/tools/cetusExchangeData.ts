import { CetusClient } from '@/lib/cetus'
import { tool } from 'ai'
import { z } from 'zod'

export const getExchangeData = tool({
  description: 'Get the current informational exchange data for Cetus Exchange.',
  parameters: z.object({}),

  execute: async () => {
    try {
      const cetusClient = new CetusClient()

      const response = await cetusClient.getExchangeInfo()

      return response
    } catch (error) {
      console.error('Error initializing BluefinClient:', error)
    }
  },
})
