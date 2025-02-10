import { tool } from 'ai'
import { z } from 'zod'
import { AtomaClient } from '@/lib/atoma'
import { CetusClient } from '@/lib/cetus'

export const getCetusTopAprPools = tool({
  description:
    'Get the top 3 apr pools in Cetus Exchange. Only use it when the word pools or apr is mentioned in the Cetus Exchange context.',
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
      const cetusClient = new CetusClient()
      const atomaClient = new AtomaClient()
      const pools = await cetusClient.getPoolsInfo(limit)

      // const prompt = `
      // The following is a list of pools with their apr and tvl:
      // ${JSON.stringify(pools)}

      // Please format the output to be human readable and make it pretty.
      // `

      // return await atomaClient.getChatCompletition(prompt)
      return pools
    } catch (error) {
      console.error('Error fetching Cetus pools:', error)
    }
  },
})
