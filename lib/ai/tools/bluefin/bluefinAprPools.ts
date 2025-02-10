import { tool } from 'ai'
import { z } from 'zod'
import { BluefinClient } from '@/lib/bluefin'
import { AtomaClient } from '@/lib/atoma'

export const getBluefinTopAprPools = tool({
  description:
    'Get the top 3 apr pools in Bluefin Exchange. Only use it when the word pools or apr is mentioned in the Bluefin Exchange context.',
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
      const bluefinClient = new BluefinClient()
      const atomaClient = new AtomaClient()
      const pools = await bluefinClient.getPoolsInfo(poolsAddresses, tokenAddress, limit)

      const prompt = `
      The following is a list of pools with their apr and tvl:
      ${JSON.stringify(pools)}

      Please format the output to be human readable and make it pretty.
      `

      return await atomaClient.getChatCompletition(prompt)
    } catch (error) {
      console.error('Error initializing BluefinClient:', error)
    }
  },
})
