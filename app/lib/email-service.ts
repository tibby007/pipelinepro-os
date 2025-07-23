import { OutreachActivity } from '@prisma/client';

interface EmailProvider {
  sendEmail(params: EmailParams): Promise<EmailResult>;
  getWebhookHandler(): (req: any) => Promise<WebhookEvent>;
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  trackingId?: string;
}

interface EmailResult {
  messageId: string;
  status: 'sent' | 'failed';
  error?: string;
}

interface WebhookEvent {
  type: 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained';
  email: string;
  trackingId?: string;
  timestamp: Date;
}

// SendGrid implementation (you'll need to install @sendgrid/mail)
class SendGridProvider implements EmailProvider {
  private sgMail: any;

  constructor(apiKey: string) {
    // Uncomment when @sendgrid/mail is installed
    // this.sgMail = require('@sendgrid/mail');
    // this.sgMail.setApiKey(apiKey);
  }

  async sendEmail(params: EmailParams): Promise<EmailResult> {
    try {
      // const msg = {
      //   to: params.to,
      //   from: params.from,
      //   subject: params.subject,
      //   text: params.text,
      //   html: params.html,
      //   replyTo: params.replyTo,
      //   customArgs: {
      //     trackingId: params.trackingId,
      //   },
      // };
      
      // const [response] = await this.sgMail.send(msg);
      
      // return {
      //   messageId: response.headers['x-message-id'],
      //   status: 'sent',
      // };

      // Placeholder implementation
      console.log('SendGrid email would be sent:', params);
      return {
        messageId: `msg_${Date.now()}`,
        status: 'sent',
      };
    } catch (error: any) {
      return {
        messageId: '',
        status: 'failed',
        error: error.message,
      };
    }
  }

  getWebhookHandler() {
    return async (req: any): Promise<WebhookEvent> => {
      // Parse SendGrid webhook events
      const events = req.body;
      const event = events[0]; // Process first event
      
      return {
        type: this.mapEventType(event.event),
        email: event.email,
        trackingId: event.trackingId,
        timestamp: new Date(event.timestamp * 1000),
      };
    };
  }

  private mapEventType(sgEvent: string): WebhookEvent['type'] {
    switch (sgEvent) {
      case 'delivered': return 'delivered';
      case 'open': return 'opened';
      case 'click': return 'clicked';
      case 'bounce': return 'bounced';
      case 'spamreport': return 'complained';
      default: return 'delivered';
    }
  }
}

// Factory to create email provider
export function createEmailProvider(provider: 'sendgrid' | 'ses' | 'smtp', config: any): EmailProvider {
  switch (provider) {
    case 'sendgrid':
      return new SendGridProvider(config.apiKey);
    // Add other providers as needed
    default:
      throw new Error(`Unsupported email provider: ${provider}`);
  }
}

// Email service that uses the provider
export class EmailService {
  private provider: EmailProvider;
  private defaultFrom: string;

  constructor(provider: EmailProvider, defaultFrom: string) {
    this.provider = provider;
    this.defaultFrom = defaultFrom;
  }

  async sendOutreachEmail(
    activity: OutreachActivity & { prospect: { email: string; contactName?: string } },
    customFrom?: string
  ): Promise<EmailResult> {
    const emailParams: EmailParams = {
      to: activity.prospect.email,
      from: customFrom || this.defaultFrom,
      subject: activity.subject || 'Business Funding Opportunity',
      text: activity.content || '',
      trackingId: activity.id,
    };

    // Convert plain text to basic HTML
    if (activity.content && !emailParams.html) {
      emailParams.html = activity.content
        .split('\n')
        .map(line => `<p>${line}</p>`)
        .join('');
    }

    return await this.provider.sendEmail(emailParams);
  }

  async handleWebhook(req: any): Promise<WebhookEvent> {
    const handler = this.provider.getWebhookHandler();
    return await handler(req);
  }
}

// Singleton instance
let emailService: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailService) {
    const provider = process.env.EMAIL_PROVIDER || 'sendgrid';
    const config = {
      apiKey: process.env.SENDGRID_API_KEY || process.env.EMAIL_API_KEY,
    };
    const defaultFrom = process.env.EMAIL_FROM || 'noreply@pipelinepro.com';
    
    const emailProvider = createEmailProvider(provider as any, config);
    emailService = new EmailService(emailProvider, defaultFrom);
  }
  
  return emailService;
}