import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CommunicationService } from '@/lib/ai/communication-service';

const communicationService = new CommunicationService();

// This webhook can be called by email services like SendGrid, Twilio, etc.
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (implementation depends on service)
    const signature = request.headers.get('x-webhook-signature');
    // TODO: Implement signature verification based on your email/messaging service

    const body = await request.json();
    const { from, to, subject, text, prospectEmail, channel = 'EMAIL' } = body;

    // Find prospect by email
    const prospect = await prisma.prospect.findFirst({
      where: {
        email: prospectEmail || from,
      },
      include: {
        user: true,
      },
    });

    if (!prospect) {
      console.log('Prospect not found for email:', prospectEmail || from);
      return NextResponse.json({ success: true, message: 'Prospect not found' });
    }

    // Get conversation history
    const conversationHistory = await prisma.outreachActivity.findMany({
      where: { prospectId: prospect.id },
      orderBy: { createdAt: 'asc' },
      take: 20, // Last 20 messages for context
    });

    // Generate AI response
    const aiResponse = await communicationService.handleIncomingMessage(
      prospect,
      text || subject,
      conversationHistory
    );

    // Save incoming message
    await prisma.outreachActivity.create({
      data: {
        prospectId: prospect.id,
        userId: prospect.userId,
        type: channel,
        subject: subject || 'Incoming Message',
        content: text,
        status: 'RECEIVED',
        response: text,
        respondedAt: new Date(),
      },
    });

    // Save AI response as outgoing activity
    const outgoingActivity = await prisma.outreachActivity.create({
      data: {
        prospectId: prospect.id,
        userId: prospect.userId,
        type: channel,
        subject: `Re: ${subject || 'Your Inquiry'}`,
        content: aiResponse,
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    // Queue the response to be sent (you'll need to implement the actual sending)
    // This could be through SendGrid, AWS SES, Twilio, etc.
    await queueEmailResponse({
      to: prospect.email,
      from: prospect.user.email || 'noreply@pipelinepro.com',
      subject: outgoingActivity.subject!,
      text: aiResponse,
      activityId: outgoingActivity.id,
    });

    return NextResponse.json({ 
      success: true, 
      activityId: outgoingActivity.id,
      message: 'Response queued' 
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to queue email responses
async function queueEmailResponse(params: {
  to: string;
  from: string;
  subject: string;
  text: string;
  activityId: string;
}) {
  // TODO: Implement actual email sending through your preferred service
  // For now, we'll just log it
  console.log('Queueing email response:', params);
  
  // Update activity status when sent
  setTimeout(async () => {
    await prisma.outreachActivity.update({
      where: { id: params.activityId },
      data: { 
        status: 'DELIVERED',
        openedAt: new Date(), // This would be set by email tracking
      },
    });
  }, 1000);
}