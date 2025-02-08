// eslint-disable-next-line import/no-named-as-default
import CetusClmmSDK, { initCetusSDK } from '@cetusprotocol/cetus-sui-clmm-sdk'

export class CetusClient {
  private client: CetusClmmSDK

  constructor() {
    this.client = initCetusSDK({ network: 'mainnet' })
  }

  async getAllPools() {}

  async getPoolInfo(poolId: string) {}

  async getPoolApr() {}
}
