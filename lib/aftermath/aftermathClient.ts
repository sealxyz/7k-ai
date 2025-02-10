import { Aftermath } from 'aftermath-ts-sdk'

export class AftermathClient {
  constructor() {}

  async getPools() {
    const afSdk = new Aftermath('MAINNET')
    await afSdk.init() // initialize provider

    const pools = afSdk.Pools()
    return pools
  }
}
