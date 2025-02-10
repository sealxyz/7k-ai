import { tool } from 'ai'
import { z } from 'zod'
import { BluefinClient } from '@/lib/bluefin'
import { AtomaClient } from '@/lib/atoma'

export const getBluefinUserLpPositions = tool({
  description:
    'Get the user lp positions in Bluefin Exchange. Only use it when the word lp or positions is mentioned in the Bluefin Exchange context.',
  parameters: z.object({}),

  execute: async ({}) => {
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
