import { CetusClient } from '@/lib/cetus'
import { tool } from 'ai'
import { z } from 'zod'

export const getCetusExchangeData = tool({
  description:
    'Get the current informational exchange data for Cetus Exchange. Please transform the json object that will have the following format in a text format: {pure_tvl_in_usd: string, total_volume: string, number_of_users: string, number_of_tokens: number, last_24h_volume: string, last_7d_volume: string, last_30d_volume: string}',
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
