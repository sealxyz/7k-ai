import { BluefinClient as BluefinClientV2, Networks } from '@bluefin-exchange/bluefin-v2-client'
import { config } from 'dotenv'
import { PoolFrequencyFetch, SPOT_API_URL } from './constants'
import { GetExchangeInfoDto } from './dto'
import { BluefinService } from './bluefin.service'

config({
  path: '.env',
})

export class BluefinClient {
  private client: BluefinClientV2
  private signature: string = ''
  private bluefinService: BluefinService

  constructor() {
    this.client = new BluefinClientV2(
      true,
      process.env.SUI_NETWORK === 'MAINNET' ? Networks.PRODUCTION_SUI : Networks.TESTNET_SUI,
      process.env.SUI_PRIVATE_SEEDPHRASE!,
      'ED25519',
    )
    this.bluefinService = new BluefinService()
  }

  async init() {
    await this.client.init()
    this.signature = await this.client.createOnboardingSignature({
      useDeprecatedSigningMethod: true,
    })
  }

  async getPublicAddress() {
    return this.client.getPublicAddress()
  }

  ///////////////////////////////////////////////////// TRADE API /////////////////////////////////////////////////////

  /**
   * Get market data for a given symbol
   * @param symbol - The symbol of the market to get data for
   * @returns The market data for the given symbol
   */
  async getTradeMarketData(symbol?: string) {
    const response = await this.client.getMarketData(symbol)
    return response.data
  }

  /**
   * Get master info for a given symbol
   * @param symbol - The symbol of the market to get info for
   * @returns The master info for the given symbol
   */
  async getTradeMasterInfo(symbol?: string) {
    const response = await this.client.getMasterInfo(symbol)
    return response.data
  }

  async getTradeClientInfo() {
    const response = await this.client.getUserPosition({
      parentAddress: this.client.getPublicAddress(),
    })
    return response.data
  }

  ///////////////////////////////////////////////////// SPOT API /////////////////////////////////////////////////////

  /**
   * Get exchange info for a given symbol
   * @param symbol - The symbol of the market to get info for
   * @returns The exchange info for the given symbol
   */
  async getMarketExchangeInfo(): Promise<any> {
    const response = await this.client.getExchangeInfo()
    return response.data
  }

  /**
   * Get exchange info
   * @returns The exchange info
   */
  async getExchangeInfo(): Promise<GetExchangeInfoDto> {
    try {
      const response = await fetch(`${SPOT_API_URL}/info`)
      const data = await response.json()
      return data
    } catch (error) {
      throw new Error('Error getting exchange info', { cause: error })
    }
  }

  /**
   * Get pools info for a given token
   * @param pools - The pools to get info for
   * @param token - The token to get info for
   * @returns The pools info for the given token
   */
  async getPoolsInfo(pools?: string[], token?: string) {
    try {
      const queryParams = new URLSearchParams()

      if (pools && pools.length > 0) {
        queryParams.append('pools', pools.join(','))
      }
      if (token) {
        queryParams.append('token', token)
      }

      const response = await fetch(`${SPOT_API_URL}/pools/info?${queryParams.toString()}`)
      const data = await response.json()
      return this.bluefinService.formatTopPools(data, ['apr', 'tvl', 'volume'])
    } catch (error) {
      console.error(error)
      return null
    }
  }

  /**
   * Get pools stats for a given pools and frequency
   * @param pools - The pools to get stats for
   * @param frequency - The frequency to get stats for
   * @returns The pools stats for the given pools and frequency
   */
  async getPoolsStats(pools?: string[], frequency?: PoolFrequencyFetch) {
    try {
      const queryParams = new URLSearchParams()

      if (pools && pools.length > 0) {
        queryParams.append('pools', pools.join(','))
      }
      if (frequency) {
        queryParams.append('interval', frequency)
      }

      const response = await fetch(`${SPOT_API_URL}/pool/stats/line?${queryParams.toString()}`)
      return response.json()
    } catch (error) {
      console.error(error)
      return null
    }
  }

  async getTokensInfo(tokens?: string[]) {
    try {
      const queryParams = new URLSearchParams()

      if (tokens && tokens.length > 0) {
        queryParams.append('tokens', tokens.join(','))
      }

      const response = await fetch(`${SPOT_API_URL}/tokens/info?${queryParams.toString()}`)
      return response.json()
    } catch (error) {
      console.error(error)
      return null
    }
  }

  /**
   * Get token price for a given token
   * @param token - The token to get price for
   * @returns The token price for the given token
   */
  async getTokenPrice(token: string) {
    try {
      const response = await fetch(`${SPOT_API_URL}/tokens/price?tokens=${token}`)
      return response.json()
    } catch (error) {
      console.error(error)
      return null
    }
  }
}
