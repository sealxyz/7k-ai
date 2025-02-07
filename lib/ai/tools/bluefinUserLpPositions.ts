import { SuiClient } from '@/lib/bluefin/suiClient'
import { tool } from 'ai'
import { z } from 'zod'

export const getUserLpPositions = tool({
  description: 'Get all LP positions for a user on Bluefin Exchange',
  parameters: z.object({
    userAddress: z.string().describe('The SUI wallet address of the user')
  }),

  execute: async ({ userAddress }) => {
    try {
      const suiClient = new SuiClient()

      // Get user's LP positions
      const positions = await suiClient.getUserPositions(userAddress)

      // TODO: Add calculations and analysis of LP positions
      if (!positions || positions.length === 0) {
        console.log(`No LP positions found for ${userAddress}`)
        return { message: "No liquidity positions found for this user." }
      }

      console.log(`Retrieved ${positions.length} LP positions`)
      return positions
    } catch (error) {
      console.error('Error getting user LP positions:', error)
      throw error
    }
  },
})
