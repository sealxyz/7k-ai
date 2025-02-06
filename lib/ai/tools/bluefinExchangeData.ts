import { BluefinClient } from '@/lib/bluefin'
import { tool } from 'ai'
import { z } from 'zod'

export const getExchangeData = tool({
  description: 'Get the current exchange data for Bluefin Exchange',
  parameters: z.object({}),

  execute: async () => {
    try {
      const bluefinClient = new BluefinClient()

      const response = await bluefinClient.getExchangeInfo()

      return response
    } catch (error) {
      console.error('Error initializing BluefinClient:', error)
    }
  },
})
