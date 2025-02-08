import { SuiClient, BluefinClient } from '@/lib/bluefin'
import { tool } from 'ai'
import { z } from 'zod'

export const getTopAprPools = tool({
  description:
    'Get the top 3 apr pools in Bluefin Exchange. Only use it when the word pools or apr is mentioned.',
  parameters: z.object({
    limit: z.number().optional().default(3),
  }),

  execute: async ({ limit }: { limit: number }) => {
    try {
      console.log('ENTRA A LA TOOL DE APRS')
      const bluefinClient = new BluefinClient()
      const pools = await bluefinClient.getPoolsInfo()

      console.log('ACA')
      console.log(pools)

      return pools
    } catch (error) {
      console.error('Error initializing BluefinClient:', error)
    }
  },
})
