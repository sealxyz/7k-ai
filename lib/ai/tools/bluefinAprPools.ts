import { SuiClient, BluefinClient } from '@/lib/bluefin'
import { tool } from 'ai'
import { z } from 'zod'

export const getTopAprPools = tool({
  description: 'Get the top 3 apr pools in Bluefin Exchange',
  parameters: z.object({
    limit: z.number().optional().default(3),
  }),

  execute: async ({ limit }: { limit: number }) => {
    try {
      const bluefinClient = new BluefinClient()
      const pools = await bluefinClient.getPoolsInfo()
      //@TODO: Get from the pools list the top 3 apr pools
      const suiClient = new SuiClient()

      //@TODO: pass the top 3 apr pools to the suiClient
      const response = await suiClient.getPool(pools[0].id)

      return response
    } catch (error) {
      console.error('Error initializing BluefinClient:', error)
    }
  },
})
