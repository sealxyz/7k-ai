import { initCetusSDK } from '@cetusprotocol/cetus-sui-clmm-sdk'

import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const main = async () => {
  const cetusClmmSDK = initCetusSDK({ network: 'mainnet' })

  // If you want to get all pools, just pass one empty array.
  const pools = await cetusClmmSDK.Pool.getPoolsWithPage([], { limit: 200 })

  //console.log(pools)

  //console.log(`pool length: ${pools.length}`)

  const aprInfo = await fetch('https://api-sui.cetus.zone/v2/sui/swap/count', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const aprInfoData = await aprInfo.json()

  const filteredAprInfoData = aprInfoData.data.pools.filter(
    (pool) => pool.is_vaults === false && pool.stable_farming === null,
  )

  // console.log(filteredAprInfoData)

  const priceInfo = await fetch('https://api-sui.cetus.zone/v2/sui/contract/price', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const priceInfoData = await priceInfo.json()
  console.log(priceInfoData.data)
}

const args = process.argv || []
const [_node, _fname] = args

main().catch((err) => console.error(err))
