import { tool } from 'ai'
import { z } from 'zod'
import { filterCriteriaSchema } from '../toolTypes'
import { BluefinClient } from '@/lib/bluefin'

export const getTopAprPools = tool({
  description:
    'Get the top 3 apr pools in Bluefin Exchange. Only use it when the word pools or apr is mentioned.',
  parameters: z.object({
    limit: z.number().optional().default(3).describe('The number of pools to return'),
    filterCriteria: filterCriteriaSchema.optional().describe('The criteria to filter the pools'),
    tokenAddress: z.string().optional().describe('The address of the token to filter the pools'),
  }),

  execute: async ({ limit, filterCriteria, tokenAddress }) => {
    try {
      console.log('ENTRA A LA TOOL DE APRS')

      console.log('limit', limit)
      console.log('filterCriteria', filterCriteria)
      console.log('tokenAddress', tokenAddress)

      const bluefinClient = new BluefinClient()
      const pools = await bluefinClient.getPoolsInfo()

      return pools
    } catch (error) {
      console.error('Error initializing BluefinClient:', error)
    }
  },
})
