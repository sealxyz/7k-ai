import { BluefinClient } from '@/lib/bluefin'
import { tool } from 'ai'
import { z } from 'zod'

export const getExchangeData = tool({
  description: 'Get the current exchange data for Bluefin Exchange',
  parameters: z.object({}),

  execute: async () => {
    try {
      console.log('ENTRO ACA????')
      const bluefinClient = new BluefinClient()
      console.log(bluefinClient)

      const response = await bluefinClient.getExchangeInfo()

      const exchangeData = await response
      console.log(exchangeData)

      return exchangeData
    } catch (error) {
      console.error('Error initializing BluefinClient:', error)
    }
  },
})
