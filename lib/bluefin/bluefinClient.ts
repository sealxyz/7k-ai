import { BluefinClient as BluefinClientV2, Networks } from '@bluefin-exchange/bluefin-v2-client'
import { config } from 'dotenv'
import { PoolFrequencyFetch, SPOT_API_URL } from './constants'

config({
  path: '.env',
})

export class BluefinClient {
  private client: BluefinClientV2
  private signature: string = ''

  constructor() {
    this.client = new BluefinClientV2(
      true,
      process.env.SUI_NETWORK === 'MAINNET' ? Networks.PRODUCTION_SUI : Networks.TESTNET_SUI,
      process.env.SUI_PRIVATE_KEY!,
      'ED25519',
    )
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

  // TRADE API

  /**
   * Get market data for a given symbol
   * @param symbol - The symbol of the market to get data for
   * @returns The market data for the given symbol
   */
  async getMarketData(symbol?: string) {
    const response = await this.client.getMarketData(symbol)
    return response.data
  }

  /**
   * Get master info for a given symbol
   * @param symbol - The symbol of the market to get info for
   * @returns The master info for the given symbol
   */
  async getMasterInfo(symbol?: string) {
    const response = await this.client.getMasterInfo(symbol)
    return response.data
  }

  // SPOT API

  /**
   * Get exchange info for a given symbol
   * @param symbol - The symbol of the market to get info for
   * @returns The exchange info for the given symbol
   */
  async getExchangeInfo() {
    const response = await this.client.getExchangeInfo()
    return response.data
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
      return response.json()
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
