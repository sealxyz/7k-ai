import { BluefinClient, Networks } from '@bluefin-exchange/bluefin-v2-client'

import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const main = async () => {
  const bluefinClient = new BluefinClient(
    true,
    process.env.SUI_NETWORK === 'MAINNET' ? Networks.PRODUCTION_SUI : Networks.TESTNET_SUI,
    process.env.SUI_PRIVATE_SEEDPHRASE,
    'ED25519',
  )
  await bluefinClient.init()
  console.log(await bluefinClient.getPublicAddress())

  const exchangeData = await bluefinClient.getExchangeInfo()
  console.log(exchangeData)
}

const args = process.argv || []
const [_node, _fname] = args

main().catch((err) => console.error(err))
