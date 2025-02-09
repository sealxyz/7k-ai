// eslint-disable-next-line import/no-named-as-default
import CetusClmmSDK, { initCetusSDK } from '@cetusprotocol/cetus-sui-clmm-sdk'

export class CetusClient {
  private client: CetusClmmSDK

  constructor() {
    this.client = initCetusSDK({
      network: process.env.SUI_NETWORK
        ? (process.env.SUI_NETWORK as 'mainnet' | 'testnet')
        : 'mainnet',
    })
  }

  async getExchangeInfo() {
    const response = await this.client.getExchangeInfo()
    return response
  }

  async getAllPools() {}

  async getPoolInfo(poolId: string) {}

  async getPoolApr() {}
}
