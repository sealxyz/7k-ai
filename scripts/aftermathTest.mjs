import { Aftermath } from 'aftermath-ts-sdk'

const main = async () => {
  const afSdk = new Aftermath('MAINNET')
  await afSdk.init() // initialize provider

  const pools = afSdk.Pools()

  console.log(pools)
}

const args = process.argv || []
const [_node, _fname] = args

main().catch((err) => console.error(err))
