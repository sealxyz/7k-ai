import { BLEUFIN_POOL_URL_PREFIX } from './constants'
import { PoolData } from './types'

export class BluefinService {
  /**
   * Format the top pools data
   * @param data - The pools data
   * @param keys - The keys to format
   * @returns The formatted pools data
   */
  formatTopPools(data: PoolData[], keys: (keyof PoolData['day'] | 'tvl')[], limit?: number) {
    const result: Record<string, any> = {}
    keys.forEach((key) => {
      this.getTop3(data, key, limit).forEach((pool, i) => {
        result[`pool${i + 1}`] = result[`pool${i + 1}`] || {
          name: pool.poolName,
          address: pool.address,
          apr: pool.apr,
          tvl: pool.tvl,
          volume: pool.volume,
          fees: pool.fees,
          swapFees: pool.swapFees,
          poolDetails: this.formatPoolAddress(pool.address),
        }
      })
    })

    return result
  }

  /**
   * Get the top 3 pools for a given key
   * @param data - The pools data
   * @param key - The key to get the top 3 pools for
   * @returns The top 3 pools for the given key
   */
  private getTop3(data: any[], key: keyof any, limit = 3) {
    return data
      .map((pool) => ({
        poolName: this.getPoolName(pool),
        address: pool.address,
        value: parseFloat(
          key === 'tvl' ? (pool.tvl as string) : (pool.day[key as keyof PoolData['day']] as string),
        ),
        apr: parseFloat(pool.day.apr.total),
        tvl: parseFloat(pool.tvl),
        volume: parseFloat(pool.day.volume),
        fees: parseFloat(pool.day.fee),
        swapFees: parseFloat(pool.day.fee) * parseFloat(pool.feeRate) * 0.01,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit)
  }

  /**
   * Format the pool address to a clickable link
   * @param poolAddress - The pool address
   * @returns The formatted pool address
   */
  private formatPoolAddress(poolAddress: string) {
    return `${BLEUFIN_POOL_URL_PREFIX}${poolAddress}`
  }

  private getPoolName(pool: any) {
    return `${pool.tokenA.info.symbol} - ${pool.tokenB.info.symbol}`
  }
}
