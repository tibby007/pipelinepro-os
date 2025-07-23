import { createChatCompletion, ChatMessage } from '../openrouter';
import { Prospect, OutreachActivity, Qualification } from '@prisma/client';

export class CommunicationService {
  private systemPrompt = `You are an AI assistant for PipelinePro, a business funding brokerage platform. 
Your role is to:
1. Engage with potential business clients professionally
2. Pre-qualify them for funding opportunities
3. Request necessary documents
4. Answer questions about business funding

Always maintain a professional, helpful tone. Be concise but thorough.
Focus on understanding their business needs and qualifying them for appropriate funding solutions.`;

  async generateInitialOutreach(prospect: Prospect): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: this.systemPrompt },
      {
        role: 'user',
        content: `Generate a personalized initial outreach message for:
Business Name: ${prospect.businessName}
Industry: ${prospect.businessType}
Location: ${prospect.city}, ${prospect.state}

The message should:
- Introduce our funding services
- Mention their specific industry
- Ask about their funding needs
- Be warm but professional
- Be under 150 words`,
      },
    ];

    return await createChatCompletion(messages, 'BALANCED');
  }

  async handleIncomingMessage(
    prospect: Prospect,
    messageContent: string,
    conversationHistory: OutreachActivity[]
  ): Promise<string> {
    const history = this.buildConversationHistory(conversationHistory);
    
    const messages: ChatMessage[] = [
      { role: 'system', content: this.systemPrompt },
      ...history,
      { role: 'user', content: messageContent },
    ];

    return await createChatCompletion(messages, 'BALANCED');
  }

  async generateQualificationQuestions(
    prospect: Prospect,
    previousAnswers?: Partial<Qualification>
  ): Promise<string[]> {
    const messages: ChatMessage[] = [
      { role: 'system', content: this.systemPrompt },
      {
        role: 'user',
        content: `Generate 5 pre-qualification questions for a ${prospect.businessType} business.
${previousAnswers ? `Previous answers: ${JSON.stringify(previousAnswers)}` : ''}

Questions should cover:
- Monthly revenue
- Time in business
- Credit score range
- Funding amount needed
- Purpose of funding

Return as a JSON array of strings.`,
      },
    ];

    const response = await createChatCompletion(messages, 'FAST', 0.3);
    try {
      return JSON.parse(response);
    } catch {
      return [
        'What is your average monthly revenue?',
        'How long has your business been operating?',
        'What is your approximate credit score range?',
        'How much funding are you seeking?',
        'What will you use the funding for?',
      ];
    }
  }

  async analyzeQualificationResponses(
    responses: Record<string, string>
  ): Promise<{
    qualified: boolean;
    score: number;
    feedback: string;
    nextSteps: string[];
  }> {
    const messages: ChatMessage[] = [
      { role: 'system', content: this.systemPrompt },
      {
        role: 'user',
        content: `Analyze these pre-qualification responses and determine if the business qualifies for funding:
${JSON.stringify(responses, null, 2)}

Return a JSON object with:
- qualified: boolean
- score: number (0-100)
- feedback: string explaining the decision
- nextSteps: array of strings with recommended next actions`,
      },
    ];

    const response = await createChatCompletion(messages, 'BALANCED', 0.3);
    try {
      return JSON.parse(response);
    } catch {
      return {
        qualified: false,
        score: 0,
        feedback: 'Unable to analyze responses',
        nextSteps: ['Please provide more information'],
      };
    }
  }

  async generateDocumentRequest(
    prospect: Prospect,
    qualification: Qualification
  ): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: this.systemPrompt },
      {
        role: 'user',
        content: `Generate a professional message requesting documents from:
Business: ${prospect.businessName}
Industry: ${prospect.businessType}
Qualification Score: ${qualification.totalScore}

Based on their qualification, request the appropriate documents:
- Bank statements (3-6 months)
- Tax returns (if needed)
- Business license
- Other relevant documents

Make it friendly but clear about what's needed and why.`,
      },
    ];

    return await createChatCompletion(messages, 'BALANCED');
  }

  async prepareLenderSubmission(
    prospect: Prospect,
    qualification: Qualification,
    documents: string[]
  ): Promise<{
    summary: string;
    recommendedLenders: string[];
  }> {
    const messages: ChatMessage[] = [
      { role: 'system', content: this.systemPrompt },
      {
        role: 'user',
        content: `Prepare a lender submission summary for:
Business: ${prospect.businessName}
Industry: ${prospect.businessType}
Qualification Score: ${qualification.totalScore}
Documents: ${documents.join(', ')}

Create:
1. A professional summary of the business and funding request
2. List of 3-5 recommended lenders based on the business profile

Return as JSON with 'summary' and 'recommendedLenders' fields.`,
      },
    ];

    const response = await createChatCompletion(messages, 'QUALITY', 0.3);
    try {
      return JSON.parse(response);
    } catch {
      return {
        summary: 'Business funding request summary pending',
        recommendedLenders: ['General Business Lender'],
      };
    }
  }

  private buildConversationHistory(activities: OutreachActivity[]): ChatMessage[] {
    return activities
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .flatMap((activity) => {
        const messages: ChatMessage[] = [];
        
        if (activity.content) {
          messages.push({
            role: 'assistant',
            content: activity.content,
          });
        }
        
        if (activity.response) {
          messages.push({
            role: 'user',
            content: activity.response,
          });
        }
        
        return messages;
      });
  }
}