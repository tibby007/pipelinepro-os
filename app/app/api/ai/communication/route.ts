import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CommunicationService } from '@/lib/ai/communication-service';

const communicationService = new CommunicationService();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, prospectId, data } = body;

    // Verify prospect belongs to user
    const prospect = await prisma.prospect.findFirst({
      where: {
        id: prospectId,
        assignedToId: session.user.id,
      },
      include: {
        qualifications: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    let result;

    switch (action) {
      case 'generateInitialOutreach':
        result = await communicationService.generateInitialOutreach(prospect);
        break;

      case 'handleIncomingMessage':
        const conversationHistory = await prisma.outreachActivity.findMany({
          where: { prospectId },
          orderBy: { createdAt: 'asc' },
        });
        result = await communicationService.handleIncomingMessage(
          prospect,
          data.message,
          conversationHistory
        );
        break;

      case 'generateQualificationQuestions':
        result = await communicationService.generateQualificationQuestions(
          prospect,
          prospect.qualifications[0]
        );
        break;

      case 'analyzeQualificationResponses':
        result = await communicationService.analyzeQualificationResponses(
          data.responses
        );
        
        // Save qualification results
        if (result.qualified !== undefined) {
          await prisma.qualification.create({
            data: {
              prospectId,
              userId: session.user.id,
              totalScore: result.score,
              maxScore: 100,
              qualificationStatus: result.qualified ? 'QUALIFIED' : 'DISQUALIFIED',
              responses: { feedback: result.feedback },
              isComplete: true,
            },
          });
        }
        break;

      case 'generateDocumentRequest':
        if (!prospect.qualifications[0]) {
          return NextResponse.json(
            { error: 'No qualification found' },
            { status: 400 }
          );
        }
        result = await communicationService.generateDocumentRequest(
          prospect,
          prospect.qualifications[0]
        );
        break;

      case 'prepareLenderSubmission':
        if (!prospect.qualifications[0]) {
          return NextResponse.json(
            { error: 'No qualification found' },
            { status: 400 }
          );
        }
        
        const documents = await prisma.document.findMany({
          where: { prospectId },
          select: { type: true },
        });
        
        result = await communicationService.prepareLenderSubmission(
          prospect,
          prospect.qualifications[0],
          documents.map((d) => d.type)
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('AI Communication error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}