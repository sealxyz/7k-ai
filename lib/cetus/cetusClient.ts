import { CetusService } from './cetus.service'
import { CETUS_POOL_INFO_API_URL } from './constants'
import { CetusExchangeInfoDto } from './dto/getExchangeInfo.dto'

export class CetusClient {
  private network: 'mainnet' | 'testnet'
  private cetusService: CetusService

  constructor() {
    this.network = (process.env.SUI_NETWORK?.toLowerCase() as 'mainnet' | 'testnet') ?? 'mainnet'
    this.cetusService = new CetusService()
  }

  /**
   * Get the exchange info
   * @returns The exchange info
   */
  async getExchangeInfo(): Promise<CetusExchangeInfoDto> {
    const response = await fetch(CETUS_POOL_INFO_API_URL[this.network])
    const data = (await response.json()).data

    return {
      pure_tvl_in_usd: data.pure_tvl_in_usd,
      last_24h_volume: data.vol_usd.day,
      last_7d_volume: data.vol_usd.week,
      last_30d_volume: data.vol_usd.month,
      total_volume: data.vol_usd.total,
      number_of_users: data.user_num,
      number_of_tokens: data.token_num,
    }
  }

  /**
   * Get the pools info
   * @param limit - The limit of pools to return
   * @returns The pools info
   */
  async getPoolsInfo(limit?: number) {
    const response = await fetch(CETUS_POOL_INFO_API_URL[this.network])
    const data = (await response.json()).data.pools

    const filteredPools = data.filter(
      (pool: any) => pool.is_vaults === false && pool.stable_farming === null,
    )

    return this.cetusService.formatTopPools(
      filteredPools,
      ['apr_24h', 'tvl_in_usd', 'vol_in_usd_24h'],
      limit,
    )
  }

  async getPoolInfo(poolId: string) {}

  async getPoolApr() {}
}
