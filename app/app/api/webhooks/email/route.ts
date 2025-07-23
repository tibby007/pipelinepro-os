import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEmailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (implementation depends on provider)
    const signature = request.headers.get('x-webhook-signature');
    // TODO: Implement signature verification based on your email service

    const emailService = getEmailService();
    const event = await emailService.handleWebhook(request);

    // Update outreach activity based on event
    if (event.trackingId) {
      const updateData: any = {};
      
      switch (event.type) {
        case 'delivered':
          updateData.status = 'DELIVERED';
          updateData.sentAt = event.timestamp;
          break;
        case 'opened':
          updateData.status = 'OPENED';
          updateData.openedAt = event.timestamp;
          updateData.emailOpened = true;
          break;
        case 'clicked':
          updateData.emailClicked = true;
          break;
        case 'bounced':
        case 'complained':
          updateData.status = 'FAILED';
          break;
      }

      await prisma.outreachActivity.update({
        where: { id: event.trackingId },
        data: updateData,
      });

      // Create analytics event
      const activity = await prisma.outreachActivity.findUnique({
        where: { id: event.trackingId },
        select: { prospectId: true, userId: true },
      });

      if (activity) {
        await prisma.analyticsEvent.create({
          data: {
            prospectId: activity.prospectId,
            userId: activity.userId,
            eventType: `email_${event.type}`,
            eventData: { email: event.email },
            createdAt: event.timestamp,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}