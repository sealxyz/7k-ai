import LpPositions from './LpPositions.json'

export class SuiClient {
  constructor() {}

  /**
   * Get pool details
   * @param poolId - pool id
   * @returns
   */
  async getPool(poolId: string) {
    const position = LpPositions.positions.find(position => position.pool_id === poolId)
    return position?.pool
  }

  /**
   * Get user positions
   * @param address - user address
   * @returns
   */
  async getUserPositions(address: string) {
    const positions = LpPositions.positions;
    return positions.map(position => ({
    pool_id: position.pool_id,
    position_id: position.position_id,
    lower_tick: position.lower_tick,
    upper_tick: position.upper_tick,
    liquidity: position.liquidity,
    fee_growth_coin_a: position.fee_growth_coin_a,
    fee_growth_coin_b: position.fee_growth_coin_b,
    fee_rate: position.fee_rate,
    token_a_fee: position.token_a_fee,
    token_b_fee: position.token_b_fee
  }))
  }

  async fetchPoolTransactionsByAddress(poolId: string, userAddress: string, type: string) {
    try {
      const position = LpPositions.positions.find(
        position => position.pool_id === poolId
      )
      return position?.pool?.transactions || []
    } catch (error) {
      console.error("Error fetching transactions:", error)
      return []
    }
  }

  async getCoinAmountsFromPosition(position: any, pool: any) {
    try {
      const positionData = LpPositions.positions.find(p => p.position_id === position.position_id)
      return positionData?.coin_amounts

    } catch (error) {
      console.error(`Error calculating coin amounts:`, error)
      return null
    }
  }

  async getTokenPrice(token: string) {
    try {
      const SPOT_API_URL = 'https://swap.api.sui-prod.bluefin.io/api/v1'
      const tokenAddress = token === "0x2::sui::SUI" ? 
        "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI" : 
        token

      const response = await fetch(`${SPOT_API_URL}/tokens/price?tokens=${tokenAddress}`)
      const data = await response.json()
      return data?.[0]?.price || "N/A"
    } catch (error) {
      console.error(`Error fetching token price:`, error)
      return "N/A"
    }
  }

  async getAccruedFeeAndRewards(position: any, pool: any, privateKey: string) {
    try {
      const positionData = LpPositions.positions.find(p => p.position_id === position.position_id)
      return { totalRewardsUSD: positionData?.total_rewards_usd, totalFeesUSD: positionData?.total_fees_usd }
    } catch (error) {
      console.error(`Error calculating fees and rewards:`, error)
      return { totalRewardsUSD: 0, totalFeesUSD: 0 }
    }
  }

  async calculateInitialPrice(position: any, userAddress: string, pool: any) {
    try {
      const addLiquidityTransactions = await this.fetchPoolTransactionsByAddress(position.pool_id, userAddress, "AddLiquidity")
      if (!addLiquidityTransactions?.length) return null

      const tx = addLiquidityTransactions[0]
      const amountA = parseFloat(tx.tokens[0].amount) / Math.pow(10, pool.coin_a.decimals)
      const amountB = parseFloat(tx.tokens[1].amount) / Math.pow(10, pool.coin_b.decimals)

      return amountB / amountA
    } catch (error) {
      console.error(`Error calculating initial price:`, error)
      return null
    }
  }

  calculateImpermanentLoss(initialPrice: number, currentPrice: number) {
    if (initialPrice <= 0 || currentPrice <= 0) return null
    const P = currentPrice / initialPrice
    return 1 - (2 * Math.sqrt(P)) / (1 + P)
  }
}
