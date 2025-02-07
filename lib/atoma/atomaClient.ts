import { config } from 'dotenv'
import { ATOMA_API_URL, ATOMA_MODELS } from './constants'

config({
  path: '.env',
})

export class AtomaClient {
  private apiKey: string
  private model: ATOMA_MODELS = ATOMA_MODELS.LLAMA

  constructor() {
    this.apiKey = process.env.ATOMA_API_KEY!
  }

  async updateModel(model: ATOMA_MODELS) {
    this.model = model
  }

  async getChatCompletition(prompt: string) {
    const response = await fetch(`${ATOMA_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 128,
      }),
    })
    return response.json()
  }
}
