
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create test users
  const hashedPassword = await bcrypt.hash('johndoe123', 12);
  
  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@doe.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@ccc.com' },
    update: {},
    create: {
      name: 'Sarah Johnson',
      email: 'manager@ccc.com',
      password: await bcrypt.hash('manager123', 12),
      role: 'MANAGER',
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@ccc.com' },
    update: {},
    create: {
      name: 'Mike Wilson',
      email: 'user@ccc.com',
      password: await bcrypt.hash('user123', 12),
      role: 'USER',
    },
  });

  console.log('✅ Test users created');

  // Create sample prospects
  const sampleProspects = [
    {
      businessName: 'Downtown Medical Center',
      contactName: 'Dr. Emily Rodriguez',
      email: 'erodriguez@downtownmedical.com',
      phone: '(555) 123-4567',
      address: '123 Main Street',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      businessType: 'MEDICAL_OFFICE' as const,
      monthlyRevenue: 45000,
      yearsInBusiness: 3.5,
      employeeCount: 12,
      website: 'https://downtownmedical.com',
      status: 'NEW' as const,
      qualificationScore: 85,
      isQualified: true,
      notes: 'High-volume medical practice with strong revenue. Good candidate for financing.',
      tags: ['high-priority', 'medical-office', 'los-angeles'],
      source: 'Google Maps Research',
      assignedToId: testUser.id,
    },
    {
      businessName: 'Bright Smiles Dental',
      contactName: 'Dr. Michael Chen',
      email: 'mchen@brightsmiles.com',
      phone: '(555) 234-5678',
      address: '456 Oak Avenue',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      businessType: 'DENTAL_PRACTICE' as const,
      monthlyRevenue: 32000,
      yearsInBusiness: 2.0,
      employeeCount: 8,
      website: 'https://brightsmiles.com',
      status: 'CONTACTED' as const,
      qualificationScore: 75,
      isQualified: true,
      notes: 'Growing dental practice. Owner interested in expansion financing.',
      tags: ['dental', 'expansion', 'san-francisco'],
      source: 'LinkedIn Outreach',
      assignedToId: managerUser.id,
    },
    {
      businessName: 'City Veterinary Clinic',
      contactName: 'Dr. Lisa Thompson',
      email: 'lthompson@cityvet.com',
      phone: '(555) 345-6789',
      address: '789 Pine Street',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      businessType: 'VETERINARY_CLINIC' as const,
      monthlyRevenue: 28000,
      yearsInBusiness: 5.0,
      employeeCount: 15,
      website: 'https://cityvet.com',
      status: 'QUALIFIED' as const,
      qualificationScore: 90,
      isQualified: true,
      notes: 'Established vet clinic with excellent financials. Ready for application.',
      tags: ['veterinary', 'established', 'denver'],
      source: 'Referral',
      assignedToId: regularUser.id,
    },
    {
      businessName: 'Wellness Physical Therapy',
      contactName: 'Sarah Martinez',
      email: 'smartinez@wellnesspt.com',
      phone: '(555) 456-7890',
      address: '321 Elm Street',
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
      businessType: 'PHYSICAL_THERAPY' as const,
      monthlyRevenue: 25000,
      yearsInBusiness: 1.5,
      employeeCount: 6,
      website: 'https://wellnesspt.com',
      status: 'NURTURING' as const,
      qualificationScore: 65,
      isQualified: true,
      notes: 'Growing PT practice. Needs to establish more credit history.',
      tags: ['physical-therapy', 'growing', 'austin'],
      source: 'Cold Email',
      assignedToId: testUser.id,
    },
    {
      businessName: 'Metro Mental Health',
      contactName: 'Dr. Robert Kim',
      email: 'rkim@metromentalhealth.com',
      phone: '(555) 567-8901',
      address: '654 Maple Drive',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      businessType: 'MENTAL_HEALTH' as const,
      monthlyRevenue: 35000,
      yearsInBusiness: 4.0,
      employeeCount: 10,
      website: 'https://metromentalhealth.com',
      status: 'SUBMITTED' as const,
      qualificationScore: 80,
      isQualified: true,
      notes: 'Application submitted for practice expansion loan.',
      tags: ['mental-health', 'expansion', 'seattle'],
      source: 'Google Ads',
      assignedToId: managerUser.id,
    },
    {
      businessName: 'QuickCare Urgent Care',
      contactName: 'Dr. Amanda White',
      email: 'awhite@quickcare.com',
      phone: '(555) 678-9012',
      address: '987 Cedar Lane',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      businessType: 'URGENT_CARE' as const,
      monthlyRevenue: 55000,
      yearsInBusiness: 2.5,
      employeeCount: 20,
      website: 'https://quickcare.com',
      status: 'CONVERTED' as const,
      qualificationScore: 95,
      isQualified: true,
      notes: 'Successfully funded $150K equipment loan. Excellent client.',
      tags: ['urgent-care', 'funded', 'miami'],
      source: 'Referral',
      assignedToId: testUser.id,
    },
    {
      businessName: 'Neighborhood Pharmacy',
      contactName: 'James Brown',
      email: 'jbrown@neighborhoodpharm.com',
      phone: '(555) 789-0123',
      address: '147 Broadway',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      businessType: 'PHARMACY' as const,
      monthlyRevenue: 42000,
      yearsInBusiness: 8.0,
      employeeCount: 12,
      website: 'https://neighborhoodpharm.com',
      status: 'NEW' as const,
      qualificationScore: 88,
      isQualified: true,
      notes: 'Well-established pharmacy looking for inventory financing.',
      tags: ['pharmacy', 'inventory', 'new-york'],
      source: 'Trade Show',
      assignedToId: regularUser.id,
    },
  ];

  // Check if prospects already exist
  const existingProspects = await prisma.prospect.findMany();
  
  if (existingProspects.length === 0) {
    for (const prospectData of sampleProspects) {
      await prisma.prospect.create({
        data: {
          ...prospectData,
          lastContactDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
          nextFollowUpDate: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000), // Random date within next 14 days
        },
      });
    }
  } else {
    console.log('✅ Prospects already exist, skipping creation');
  }

  console.log('✅ Sample prospects created');

  // Create email templates
  const emailTemplates = [
    {
      name: 'Initial Contact - Medical Office',
      subject: 'Healthcare Business Financing Solutions',
      content: `Hi {{contactName}},

I hope this message finds you well. My name is {{senderName}} from Commercial Capital Connect, and I specialize in helping healthcare practices like {{businessName}} access the capital they need to grow and thrive.

I noticed your practice and was impressed by your commitment to providing quality healthcare to your community. Many healthcare professionals are finding that having access to flexible financing options helps them:

• Upgrade medical equipment and technology
• Expand their practice or add new services
• Improve cash flow during seasonal fluctuations
• Take advantage of growth opportunities

Would you be interested in a brief conversation about how we might be able to support {{businessName}}'s financial goals? I'd be happy to discuss options that could work for your specific situation.

Best regards,
{{senderName}}
{{senderTitle}}
Commercial Capital Connect
{{senderPhone}}
{{senderEmail}}`,
      type: 'initial_contact',
      isActive: true,
      createdById: testUser.id,
    },
    {
      name: 'Follow-up Email',
      subject: 'Following up on financing options for {{businessName}}',
      content: `Hi {{contactName}},

I wanted to follow up on my previous message regarding financing solutions for {{businessName}}.

I understand that as a healthcare professional, your time is incredibly valuable, and I don't want to take up too much of it. However, I believe we might have some financing options that could be beneficial for your practice.

Some of our recent healthcare clients have used our services to:
• Finance new equipment purchases
• Support practice expansion
• Improve working capital
• Consolidate existing debt

Would you have 10 minutes this week for a brief phone conversation? I'm confident I can provide some valuable insights specific to healthcare businesses like yours.

Looking forward to hearing from you.

Best regards,
{{senderName}}`,
      type: 'follow_up',
      isActive: true,
      createdById: testUser.id,
    },
    {
      name: 'Qualification Questions',
      subject: 'Quick questions about {{businessName}}',
      content: `Hi {{contactName}},

Thank you for your interest in our financing solutions for {{businessName}}.

To better understand how we can best serve your needs, I'd like to ask a few quick questions:

1. What is your primary goal for seeking financing? (equipment, expansion, working capital, etc.)
2. What is your approximate monthly revenue?
3. How long has your practice been in operation?
4. Do you currently have any existing business debt?

This information will help me recommend the most suitable financing options for your situation. All information is kept strictly confidential.

Would you prefer to discuss these over a brief phone call, or would you be comfortable responding via email?

Best regards,
{{senderName}}`,
      type: 'qualification',
      isActive: true,
      createdById: managerUser.id,
    },
  ];

  // Check if email templates already exist
  const existingTemplates = await prisma.emailTemplate.findMany();
  
  if (existingTemplates.length === 0) {
    for (const template of emailTemplates) {
      await prisma.emailTemplate.create({
        data: template,
      });
    }
  } else {
    console.log('✅ Email templates already exist, skipping creation');
  }

  console.log('✅ Email templates created');

  // Create sample outreach activities
  const prospects = await prisma.prospect.findMany();
  
  for (const prospect of prospects.slice(0, 3)) {
    await prisma.outreachActivity.create({
      data: {
        prospectId: prospect.id,
        userId: prospect.assignedToId!,
        type: 'EMAIL',
        subject: 'Healthcare Business Financing Solutions',
        content: 'Initial outreach email sent to prospect.',
        status: 'SENT',
        scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        emailOpened: true,
      },
    });
  }

  console.log('✅ Sample outreach activities created');

  // Create analytics events
  const eventTypes = ['prospect_added', 'email_sent', 'call_made', 'qualification_completed', 'submission_created'];
  
  for (let i = 0; i < 20; i++) {
    const randomProspect = prospects[Math.floor(Math.random() * prospects.length)];
    const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    await prisma.analyticsEvent.create({
      data: {
        prospectId: randomProspect.id,
        userId: randomProspect.assignedToId!,
        eventType: randomEventType,
        eventData: {
          source: 'seed_data',
          timestamp: new Date(),
        },
        value: Math.random() * 1000,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log('✅ Analytics events created');
  console.log('🎉 Database seeding completed successfully!');
  
  console.log('\n📋 Test Accounts Created:');
  console.log('Admin: john@doe.com / johndoe123');
  console.log('Manager: manager@ccc.com / manager123');
  console.log('User: user@ccc.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
