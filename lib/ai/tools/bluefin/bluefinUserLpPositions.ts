import { tool } from 'ai'
import { z } from 'zod'
import { SuiClient } from '@/lib/bluefin/suiClient_'

export const getBluefinUserLpPositions = tool({
  description:
    'Get the user lp positions in Bluefin Exchange. If no wallet address is provided, proceed anyway.',
  parameters: z.object({
    walletAddress: z.string().optional()
  }),

  execute: async ({ walletAddress }) => {
    try {
      const suiClient = new SuiClient()

      // Get user positions
      const positions = await suiClient.getUserPositions(walletAddress ?? '')
      
      if (!positions || positions.length === 0) {
        return "No LP positions found for this user."
      }

      // Get detailed position info
      const positionsWithDetails = await Promise.all(
        positions.map(async (position) => {
          const pool = await suiClient.getPool(position.pool_id)
          if (!pool) {
            throw new Error('Pool not found')
          }

          // Token addresses
          const coinA = pool.coin_a.address;
          const coinB = pool.coin_b.address;

          // Get token prices
          const priceA = await suiClient.getTokenPrice(coinA)
          const priceB = await suiClient.getTokenPrice(coinB)

          // Get coin amounts
          const coinAmounts = await suiClient.getCoinAmountsFromPosition(position, pool)

          if (!coinAmounts) {
            throw new Error('No coin amounts found for position')
          }
          
          // Calculate balances in USD
          const balanceA = priceA !== "N/A" ? parseFloat(priceA) * coinAmounts[0] : 0
          const balanceB = priceB !== "N/A" ? parseFloat(priceB) * coinAmounts[1] : 0
          const currentPrice = parseFloat(priceA) / parseFloat(priceB)

          const privateKey = process.env.SUI_PRIVATE_KEY
          if (!privateKey) {
            throw new Error('No private key provided')
          }

          // Get fees and rewards
          const { totalRewardsUSD, totalFeesUSD } = await suiClient.getAccruedFeeAndRewards(
            position, 
            pool,
            privateKey
          )

          // Calculate initial price and impermanent loss
          const initialPrice = await suiClient.calculateInitialPrice(position, walletAddress ?? '', pool)
          if (!initialPrice) {
            throw new Error('Initial price could not be calculated')
          }
          const impermanentLoss = suiClient.calculateImpermanentLoss(initialPrice, currentPrice)

          const positionValueUSD = balanceA + balanceB + (totalRewardsUSD ?? 0) + (totalFeesUSD ?? 0)

          return {
            poolId: position.pool_id,
            positionId: position.position_id,
            tokenA: {
              address: coinA,
              amount: coinAmounts[0],
              valueUSD: balanceA
            },
            tokenB: {
              address: coinB,
              amount: coinAmounts[1],
              valueUSD: balanceB
            },
            rewards: totalRewardsUSD,
            fees: totalFeesUSD,
            totalValueUSD: positionValueUSD,
            impermanentLoss: impermanentLoss ? `${(impermanentLoss * 100).toFixed(2)}%` : 'N/A'
          }
        })
      )

      return {
        positions: positionsWithDetails,
        totalValue: positionsWithDetails.reduce((sum, pos) => sum + pos.totalValueUSD, 0)
      }
    } catch (error) {
      console.error('Error retrieving LP positions:', error)
      return "Error retrieving LP positions. Please try again later."
    }
  },
})
