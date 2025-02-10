export type CetusPoolData = {
  name: string
  tvl_in_usd: string
  vol_in_usd_24h: string
  fee_24_h: string
  apr_24h: string
  fee: string
  coin_a: {
    name: string
    symbol: string
    address: string
    balance: string
    coingecko_id: string
  }
  coin_b: {
    name: string
    symbol: string
    address: string
    balance: string
    coingecko_id: string
  }
}
