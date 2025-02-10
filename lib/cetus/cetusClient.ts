import { CETUS_POOL_INFO_API_URL } from './constants'
import { CetusExchangeInfoDto } from './dto/getExchangeInfo.dto'

export class CetusClient {
  private network: 'mainnet' | 'testnet'

  constructor() {
    this.network = (process.env.SUI_NETWORK?.toLowerCase() as 'mainnet' | 'testnet') ?? 'mainnet'
  }

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

  async getAllPools() {}

  async getPoolInfo(poolId: string) {}

  async getPoolApr() {}
}
