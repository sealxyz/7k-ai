import { BluefinClient } from '@/lib/bluefin'
import { tool } from 'ai'
import { z } from 'zod'

export const getBluefinExchangeData = tool({
  description:
    'Get the current informational exchange data for Bluefin Exchange. Please transform the json object that will have the following format in a text format: {totalFee: string, totalVolume: string, tvl: string}',
  parameters: z.object({}),

  execute: async () => {
    try {
      const bluefinClient = new BluefinClient()

      const response = await bluefinClient.getExchangeInfo()

      return response
    } catch (error) {
      console.error('Error fetching Bluefin exchange data:', error)
    }
  },
})
