import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const main = async () => {}

const args = process.argv || []
const [_node, _fname] = args

main().catch((err) => console.error(err))
