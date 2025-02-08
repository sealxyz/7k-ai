import { PoolData } from './types'

export class BluefinService {
  formatTopPools2(data: PoolData[], keys: (keyof PoolData['day'] | 'tvl')[]) {
    const result: Record<string, any> = {}
    keys.forEach((key, index) => {
      this.getTop32(data, key).forEach((pool, i) => {
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

  formatTopPools(pools: any[]) {
    return {
      top24hAPR: this.getTop3(pools, 'apr'),
      topTVL: this.getTop3(pools, 'tvl'),
      top24hVolume: this.getTop3(pools, 'volume'),
      top24hFees: this.getTop3(pools, 'fee'),
      topSwapFees: pools
        .map((pool) => ({
          address: pool.address,
          value: parseFloat(pool.day.fee) * parseFloat(pool.feeRate) * 0.01,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 3),
    }
  }

  private getTop3 = (data: PoolData[], key: keyof PoolData['day'] | 'tvl') => {
    return data
      .map((pool) => {
        const value = key === 'tvl' ? pool.tvl : pool.day[key as keyof PoolData['day']]
        return {
          address: pool.address,
          value: parseFloat(typeof value === 'string' ? value : value.total),
        }
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
  }

  private getTop32(data: any[], key: keyof any) {
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
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
  }
}
