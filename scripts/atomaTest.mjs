import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const main = async () => {
  console.log('ENTRO ACA=??')
  const response = await fetch('https://api.atoma.network/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.ATOMA_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'meta-llama/Llama-3.3-70B-Instruct',
      messages: [
        {
          role: 'user',
          content: 'what is the capital of France?',
        },
      ],
      max_tokens: 128,
    }),
  })

  const data = (await response.json())['choices'][0]['message']['content']
  console.log(data)
}

const args = process.argv || []
const [_node, _fname] = args

main().catch((err) => console.error(err))
