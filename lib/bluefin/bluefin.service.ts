import { BLEUFIN_POOL_URL_PREFIX } from './constants'
import { PoolData } from './types'

export class BluefinService {
  /**
   * Format the top pools data
   * @param data - The pools data
   * @param keys - The keys to format
   * @returns The formatted pools data
   */
  formatTopPools(data: PoolData[], keys: (keyof PoolData['day'] | 'tvl')[]) {
    const result: Record<string, any> = {}
    keys.forEach((key, index) => {
      this.getTop3(data, key).forEach((pool, i) => {
        result[`pool${i + 1}`] = result[`pool${i + 1}`] || {
          address: pool.address,
          apr: pool.apr,
          tvl: pool.tvl,
          volume: pool.volume,
          fees: pool.fees,
          swapFees: pool.swapFees,
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
  private getTop3(data: any[], key: keyof any) {
    return data
      .map((pool) => ({
        address: pool.address,
        value: parseFloat(
          key === 'tvl' ? (pool.tvl as string) : (pool.day[key as keyof PoolData['day']] as string),
        ),
        apr: parseFloat(pool.day.apr.total),
        tvl: parseFloat(pool.tvl),
        volume: parseFloat(pool.day.volume),
        fees: parseFloat(pool.day.fee),
        swapFees: parseFloat(pool.day.fee) * parseFloat(pool.feeRate) * 0.01,
        poolDetails: this.formatPoolAddress(pool.address),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
  }

  /**
   * Format the pool address to a clickable link
   * @param poolAddress - The pool address
   * @returns The formatted pool address
   */
  private formatPoolAddress(poolAddress: string) {
    return `${BLEUFIN_POOL_URL_PREFIX}${poolAddress}`
  }
}
