import { tool } from 'ai'
import { z } from 'zod'
import { AftermathClient } from '@/lib/aftermath/aftermathClient'

export const getAftermathTopAprPools = tool({
  description:
    'Get the top 3 apr pools in Aftermath Exchange. Only use it when the word pools or apr is mentioned in the Aftermath Exchange context.',
  parameters: z.object({
    limit: z.number().optional().default(3).describe('The number of pools to return'),
    poolsAddresses: z
      .array(z.string())
      .optional()
      .describe('The pools to filter the pools. They are addresses.'),
    tokenAddress: z.string().optional().describe('The address of the token to filter the pools'),
  }),

  execute: async ({ limit, poolsAddresses, tokenAddress }) => {
    try {
      const aftermathClient = new AftermathClient()
      const pools = await aftermathClient.getPools()
      console.log(pools)
      return pools
    } catch (error) {
      console.error('Error initializing BluefinClient:', error)
    }
  },
})
