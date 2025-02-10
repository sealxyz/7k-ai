import { type Message, createDataStreamResponse, smoothStream, streamText } from 'ai'

import { auth } from '@/app/(auth)/auth'
import { customModel } from '@/lib/ai'
import { models } from '@/lib/ai/models'
import { deleteChatById, getChatById, saveChat, saveMessages } from '@/db/queries'
import { generateUUID, getMostRecentUserMessage, sanitizeResponseMessages } from '@/lib/utils'

import { generateTitleFromUserMessage } from '../../actions'
import { getBluefinExchangeData } from '@/lib/ai/tools/bluefinExchangeData'
import { getBluefinTopAprPools } from '@/lib/ai/tools/bluefinAprPools'
import { getCetusExchangeData } from '@/lib/ai/tools/cetusExchangeData'
import { AiService } from '@/lib/ai/ai.service'

export const maxDuration = 60

type AllowedTools = 'getBluefinExchangeData' | 'getBluefinTopAprPools' | 'getCetusExchangeData'

const bluefinExchangeDataTools: AllowedTools[] = ['getBluefinExchangeData', 'getBluefinTopAprPools']
const cetusExchangeDataTools: AllowedTools[] = ['getCetusExchangeData']
const allTools: AllowedTools[] = [...bluefinExchangeDataTools, ...cetusExchangeDataTools]

export async function POST(request: Request) {
  const aiService = new AiService()

  const { id, messages, modelId }: { id: string; messages: Array<Message>; modelId: string } =
    await request.json()

  const session = await auth()

  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const model = models.find((model) => model.id === modelId)

  if (!model) {
    return new Response('Model not found', { status: 404 })
  }

  const userMessage = getMostRecentUserMessage(messages)

  if (!userMessage) {
    return new Response('No user message found', { status: 400 })
  }

  const chat = await getChatById({ id })

  if (!chat) {
    const title = await generateTitleFromUserMessage({ message: userMessage })
    await saveChat({ id, userId: session.user.id, title })
  }

  await saveMessages({
    messages: [{ ...userMessage, createdAt: new Date(), chatId: id }],
  })

  const systemPrompt = aiService.createSystemPrompt()

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: customModel(model.apiIdentifier),
        system: systemPrompt,
        messages,
        maxSteps: 5,
        experimental_activeTools: allTools,
        experimental_transform: smoothStream({ chunking: 'word' }),
        experimental_generateMessageId: generateUUID,
        tools: {
          getBluefinExchangeData,
          getBluefinTopAprPools,
          getCetusExchangeData,
        },
        onFinish: async ({ response }) => {
          if (session.user?.id) {
            try {
              const responseMessagesWithoutIncompleteToolCalls = sanitizeResponseMessages(
                response.messages,
              )

              await saveMessages({
                messages: responseMessagesWithoutIncompleteToolCalls.map((message) => {
                  return {
                    id: message.id,
                    chatId: id,
                    role: message.role,
                    content: message.content,
                    createdAt: new Date(),
                  }
                }),
              })
            } catch (error) {
              console.error('Failed to save chat')
            }
          }
        },
        experimental_telemetry: {
          isEnabled: true,
          functionId: 'stream-text',
        },
      })

      result.mergeIntoDataStream(dataStream)
    },
  })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return new Response('Not Found', { status: 404 })
  }

  const session = await auth()

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const chat = await getChatById({ id })

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    await deleteChatById({ id })

    return new Response('Chat deleted', { status: 200 })
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    })
  }
}
