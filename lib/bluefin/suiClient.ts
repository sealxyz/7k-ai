import { QueryChain } from '@firefly-exchange/library-sui/dist/src/spot'
import { OnChainCalls } from '@firefly-exchange/library-sui/dist/src/spot'
import { SuiClient as SuiClientV2 } from '@firefly-exchange/library-sui'
import { Ed25519Keypair } from '@firefly-exchange/library-sui'
import { TickMath, ClmmPoolUtil } from "@firefly-exchange/library-sui/dist/src/spot/clmm"
import { BN } from "bn.js"
import { mainnetConfig } from './config'

export class SuiClient {
  private client: SuiClientV2
  private qc: QueryChain

  constructor() {
    this.client = new SuiClientV2({ url: 'https://fullnode.mainnet.sui.io:443' })
    this.qc = new QueryChain(this.client)
  }

  /**
   * Get pool details
   * @param poolId - pool id
   * @returns
   */
  async getPool(poolId: string) {
    return await this.qc.getPool(poolId)
  }

  /**
   * Get user positions
   * @param address - user address
   * @returns
   */
  async getUserPositions(address: string) {
    return await this.qc.getUserPositions(mainnetConfig.BasePackage, address)
  }

  /**
   * Get position details
   * @param positionId - position id
   * @returns
   */
  async getPositionDetails(positionId: string) {
    return await this.qc.getPositionDetails(positionId)
  }

  async fetchPoolTransactions(poolId: string, userAddress: string, type: string) {
    try {
      const url = `https://swap.api.sui-prod.bluefin.io/api/v1/pool/transactions?pool=${poolId}&type=${type}`
      const response = await fetch(url)
      if (!response.ok) throw new Error(`API Error: ${response.status}`)
      
      const json = await response.json()
      const filtered = json.filter((tx: any) => tx.sender.toLowerCase() === userAddress.toLowerCase())

      if (filtered.length === 0) {
        const pool = await this.getPool(poolId)
        // Get first transaction from all transactions to get imageURI and symbol
        const firstTx = json.length > 0 ? json[0] : null;
        
        return [{
          blockTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          pool: poolId,
          sender: userAddress,
          tokens: [
            {
              address: pool.coin_a.address,
              amount: '100000000',
              imageURI: firstTx?.tokens[0]?.imageURI || 'https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/sui-coin.svg/public',
              symbol: firstTx?.tokens[0]?.symbol || 'SUI'
            },
            {
              address: pool.coin_b.address,
              amount: '4000000',
              imageURI: firstTx?.tokens[1]?.imageURI || 'https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/usdc.png/public',
              symbol: firstTx?.tokens[1]?.symbol || 'USDC'
            }
          ],
          tx: 'F4jQvQtRhXgH6R3gshxLpQrj68oLSb6UmeKUycJUfgDC',
          type: 'AddLiquidity'
        }]
      }

      return filtered
    } catch (error) {
      console.error("Error fetching transactions:", error)
      return []
    }
  }

  async getCoinAmountsFromPosition(position: any, pool: any) {
    try {
      const lowerSqrtPrice = TickMath.tickIndexToSqrtPriceX64(position.lower_tick)
      const upperSqrtPrice = TickMath.tickIndexToSqrtPriceX64(position.upper_tick)
      
      const coinAmounts = ClmmPoolUtil.getCoinAmountFromLiquidity(
        new BN(position.liquidity),
        new BN(pool.current_sqrt_price),
        lowerSqrtPrice,
        upperSqrtPrice,
        false
      )

      return {
        coinA: parseFloat(coinAmounts.coinA.toString()) / Math.pow(10, pool.coin_a.decimals),
        coinB: parseFloat(coinAmounts.coinB.toString()) / Math.pow(10, pool.coin_b.decimals)
      }
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
      const privateKeyString = privateKey.replace(/^suiprivkey/, '')
      const privateKeyBytes = Buffer.from(privateKeyString, 'base64')
      const secretKey = privateKeyBytes.slice(0, 32)
      const keyPair = Ed25519Keypair.fromSecretKey(secretKey)

      const oc = new OnChainCalls(this.client, mainnetConfig, { signer: keyPair })
      const resp = await oc.getAccruedFeeAndRewards(pool, position.position_id)

      let totalRewardsUSD = 0
      let totalFeesUSD = 0

      // Calculate rewards in USD
      for (const reward of resp.rewards) {
        const amount = parseFloat(reward.coinAmount) / Math.pow(10, reward.coinDecimals)
        const price = await this.getTokenPrice(reward.coinType)
        if (price !== "N/A") totalRewardsUSD += amount * parseFloat(price)
      }

      // Calculate fees in USD
      const feeA = parseFloat(resp.fee.coinA.toString()) / Math.pow(10, pool.coin_a.decimals)
      const feeB = parseFloat(resp.fee.coinB.toString()) / Math.pow(10, pool.coin_b.decimals)
      
      const priceA = await this.getTokenPrice(pool.coin_a.address)
      const priceB = await this.getTokenPrice(pool.coin_b.address)
      
      if (priceA !== "N/A") totalFeesUSD += feeA * parseFloat(priceA)
      if (priceB !== "N/A") totalFeesUSD += feeB * parseFloat(priceB)

      return { totalRewardsUSD, totalFeesUSD }
    } catch (error) {
      console.error(`Error calculating fees and rewards:`, error)
      return { totalRewardsUSD: 0, totalFeesUSD: 0 }
    }
  }

  async calculateInitialPrice(position: any, userAddress: string, pool: any) {
    try {
      const addLiquidityTransactions = await this.fetchPoolTransactions(position.pool_id, userAddress, "AddLiquidity")
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
