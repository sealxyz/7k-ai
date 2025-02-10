import { AI_ASSISTANT } from './aiAssistant'

export class AiService {
  constructor() {}

  public createSystemPrompt(): string {
    // Create personality section
    const personalitySection = `
    PERSONALITY PROFILE:
    • Traits: ${AI_ASSISTANT.PERSONALITY.TRAITS.join(', ')}
    • Tone: ${AI_ASSISTANT.PERSONALITY.TONE}
    • Style: ${AI_ASSISTANT.PERSONALITY.STYLE}
    

    TOPICS & BOUNDARIES:
    Allowed Topics: ${AI_ASSISTANT.BOUNDARIES.ALLOWED_TOPICS.join(', ')}
    Topics to Avoid: ${AI_ASSISTANT.BOUNDARIES.FORBIDDEN_TOPICS.join(', ')}

    RESPONSE FILTER:
    ${AI_ASSISTANT.RESPONSE_FILTER}

    TOOLS AVAILABLE:
    ${AI_ASSISTANT.TOOLS.FUNCTIONS.map((tool) => `• ${tool}`).join('\n')}

    TOOLS GUIDE:
    ${AI_ASSISTANT.TOOLS.GUIDE}


    ${AI_ASSISTANT.BASE_PROMPT}`

    return `${personalitySection}

    SECURITY MEASURES:
    ${AI_ASSISTANT.SECURITY_MEASURES.TOPIC_CHECK}

    SECURITY RESPONSES (USE ONE RANDOMLY):
    ${AI_ASSISTANT.SECURITY_RESPONSES.join('\n')}


    AVAILABLE DISCLAIMERS:
    Analysis: ${AI_ASSISTANT.DISCLAIMER_TEMPLATES.ANALYSIS}
    Comparison: ${AI_ASSISTANT.DISCLAIMER_TEMPLATES.COMPARISON}
    Pattern: ${AI_ASSISTANT.DISCLAIMER_TEMPLATES.PATTERN}
    Suggestion: ${AI_ASSISTANT.DISCLAIMER_TEMPLATES.SUGGESTION}`
  }
}
