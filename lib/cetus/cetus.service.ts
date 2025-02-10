import { CetusPoolData } from '../ai/tools/cetus/types/poolData'

export class CetusService {
  constructor() {}

  /**
   * Format the top pools data
   * @param data - The pools data
   * @param keys - The keys to format
   * @returns The formatted pools data
   */
  public formatTopPools(data: CetusPoolData[], keys: (keyof CetusPoolData)[], limit = 3) {
    const result: Record<string, any> = {}
    keys.forEach((key) => {
      this.getTop3(data, key, limit).forEach((pool, i) => {
        result[`pool${i + 1}`] = result[`pool${i + 1}`] || {
          name: pool.name,
          apr: pool.apr,
          tvl: pool.tvl,
          volume: pool.volume,
          fees: pool.fees,
          swapFees: pool.swapFees,
          tokenA: {
            name: pool.tokenA.name,
            address: pool.tokenA.address,
            url: this.formatTokenToCoingeckoUrl(pool.tokenA.coingecko_id),
          },
          tokenB: {
            name: pool.tokenB.name,
            address: pool.tokenB.address,
            url: this.formatTokenToCoingeckoUrl(pool.tokenB.coingecko_id),
          },
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
  private getTop3(data: CetusPoolData[], key: keyof CetusPoolData, limit = 3) {
    return data
      .map((pool) => ({
        name: pool.name,
        tokenA: {
          name: pool['coin_a'].name,
          address: pool['coin_a'].address,
          coingecko_id: pool['coin_a'].coingecko_id,
        },
        tokenB: {
          name: pool['coin_b'].name,
          address: pool['coin_b'].address,
          coingecko_id: pool['coin_b'].coingecko_id,
        },
        value: parseFloat(pool[key] as string) || 0,
        apr: parseFloat(pool.apr_24h || '0'),
        tvl: parseFloat(pool.tvl_in_usd || '0'),
        volume: parseFloat(pool.vol_in_usd_24h || '0'),
        fees: parseFloat(pool.fee_24_h || '0'),
        swapFees: parseFloat(pool.fee_24_h || '0') * parseFloat(pool.fee || '0.01'),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit)
  }

  /**
   * Format a token to a Coingecko URL
   * @param token - The token to format
   * @returns The formatted URL
   */
  private formatTokenToCoingeckoUrl(token: string) {
    return `https://www.coingecko.com/en/coins/${token}`
  }
}
