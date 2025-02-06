import { config } from 'dotenv'
import { ATOMA_API_URL } from './constants'

config({
  path: '.env',
})

export class AtomaClient {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.ATOMA_API_KEY!
  }

  async getChatCompletition(prompt: string) {
    const response = await fetch(`${ATOMA_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    })
    return response.json()
  }
}
