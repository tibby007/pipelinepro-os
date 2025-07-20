
import { PrismaClient, IndustryType, IndustryCategory, BulkOperationType, BulkOperationStatus, ProspectStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PipelinePro OS database seeding...');

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

  // Create industry configurations
  const industryConfigs = [
    // Healthcare
    {
      industryType: IndustryType.MEDICAL_OFFICE,
      industryCategory: IndustryCategory.HEALTHCARE,
      displayName: 'Medical Office',
      minMonthlyRevenue: 25000,
      maxMonthlyRevenue: 150000,
      minYearsInBusiness: 1.0,
      searchTerms: ['medical office', 'clinic', 'primary care', 'family practice', 'internal medicine'],
      qualifyingQuestions: {
        questions: [
          { id: 1, text: 'What type of medical services do you provide?', type: 'text', weight: 10 },
          { id: 2, text: 'How many patients do you see per month?', type: 'number', weight: 15 },
          { id: 3, text: 'Do you accept insurance?', type: 'boolean', weight: 10 },
          { id: 4, text: 'Are you looking to expand or upgrade equipment?', type: 'boolean', weight: 20 }
        ]
      },
      valueProposition: 'Healthcare financing solutions for medical equipment, practice expansion, and working capital needs.',
      seasonalPatterns: { peak: ['Q4'], slow: ['Q1'] },
      crossSellOpportunities: ['MEDICAL_IMAGING', 'LABORATORY'],
      averageLoanSize: 75000,
      conversionRate: 0.15
    },
    {
      industryType: IndustryType.DENTAL_PRACTICE,
      industryCategory: IndustryCategory.HEALTHCARE,
      displayName: 'Dental Practice',
      minMonthlyRevenue: 20000,
      maxMonthlyRevenue: 200000,
      minYearsInBusiness: 1.0,
      searchTerms: ['dental office', 'dentist', 'orthodontist', 'oral surgery', 'dental clinic'],
      qualifyingQuestions: {
        questions: [
          { id: 1, text: 'What dental services do you offer?', type: 'text', weight: 10 },
          { id: 2, text: 'How many dental chairs do you operate?', type: 'number', weight: 15 },
          { id: 3, text: 'Do you offer cosmetic dentistry?', type: 'boolean', weight: 10 },
          { id: 4, text: 'Are you planning to add new equipment or services?', type: 'boolean', weight: 20 }
        ]
      },
      valueProposition: 'Specialized dental practice financing for equipment upgrades, practice acquisitions, and expansion.',
      seasonalPatterns: { peak: ['Q1', 'Q4'], slow: ['Q3'] },
      crossSellOpportunities: ['MEDICAL_OFFICE'],
      averageLoanSize: 85000,
      conversionRate: 0.18
    },
    // Restaurants & Food Service
    {
      industryType: IndustryType.FAST_FOOD,
      industryCategory: IndustryCategory.RESTAURANT_FOOD_SERVICE,
      displayName: 'Fast Food Restaurant',
      minMonthlyRevenue: 15000,
      maxMonthlyRevenue: 100000,
      minYearsInBusiness: 0.5,
      searchTerms: ['fast food', 'quick service', 'burger', 'pizza', 'sandwich shop'],
      qualifyingQuestions: {
        questions: [
          { id: 1, text: 'What type of cuisine do you serve?', type: 'text', weight: 10 },
          { id: 2, text: 'How many customers do you serve daily?', type: 'number', weight: 15 },
          { id: 3, text: 'Do you offer delivery services?', type: 'boolean', weight: 10 },
          { id: 4, text: 'Are you looking to expand locations or upgrade equipment?', type: 'boolean', weight: 20 }
        ]
      },
      valueProposition: 'Fast-track financing for restaurant equipment, expansion, and working capital to grow your food service business.',
      seasonalPatterns: { peak: ['Q2', 'Q4'], slow: ['Q1'] },
      crossSellOpportunities: ['CASUAL_DINING', 'CATERING'],
      averageLoanSize: 45000,
      conversionRate: 0.12
    },
    {
      industryType: IndustryType.CASUAL_DINING,
      industryCategory: IndustryCategory.RESTAURANT_FOOD_SERVICE,
      displayName: 'Casual Dining Restaurant',
      minMonthlyRevenue: 25000,
      maxMonthlyRevenue: 150000,
      minYearsInBusiness: 1.0,
      searchTerms: ['restaurant', 'casual dining', 'family restaurant', 'bistro', 'grill'],
      qualifyingQuestions: {
        questions: [
          { id: 1, text: 'What is your average check size per customer?', type: 'number', weight: 15 },
          { id: 2, text: 'How many seats does your restaurant have?', type: 'number', weight: 10 },
          { id: 3, text: 'Do you have a liquor license?', type: 'boolean', weight: 10 },
          { id: 4, text: 'Are you looking to renovate or expand?', type: 'boolean', weight: 20 }
        ]
      },
      valueProposition: 'Restaurant financing solutions for renovations, equipment upgrades, and business expansion.',
      seasonalPatterns: { peak: ['Q2', 'Q4'], slow: ['Q1'] },
      crossSellOpportunities: ['BAR_GRILL', 'CATERING'],
      averageLoanSize: 65000,
      conversionRate: 0.14
    },
    // Beauty & Wellness
    {
      industryType: IndustryType.HAIR_SALON,
      industryCategory: IndustryCategory.BEAUTY_WELLNESS,
      displayName: 'Hair Salon',
      minMonthlyRevenue: 8000,
      maxMonthlyRevenue: 80000,
      minYearsInBusiness: 0.5,
      searchTerms: ['hair salon', 'beauty salon', 'hairstylist', 'hair studio', 'salon'],
      qualifyingQuestions: {
        questions: [
          { id: 1, text: 'How many styling stations do you have?', type: 'number', weight: 15 },
          { id: 2, text: 'Do you offer color services?', type: 'boolean', weight: 10 },
          { id: 3, text: 'What is your average service price?', type: 'number', weight: 10 },
          { id: 4, text: 'Are you looking to expand or upgrade equipment?', type: 'boolean', weight: 20 }
        ]
      },
      valueProposition: 'Beauty industry financing for salon equipment, renovations, and business growth.',
      seasonalPatterns: { peak: ['Q2', 'Q4'], slow: ['Q1'] },
      crossSellOpportunities: ['NAIL_SALON', 'SPA_WELLNESS'],
      averageLoanSize: 35000,
      conversionRate: 0.16
    },
    {
      industryType: IndustryType.SPA_WELLNESS,
      industryCategory: IndustryCategory.BEAUTY_WELLNESS,
      displayName: 'Spa & Wellness Center',
      minMonthlyRevenue: 15000,
      maxMonthlyRevenue: 120000,
      minYearsInBusiness: 1.0,
      searchTerms: ['spa', 'wellness center', 'massage therapy', 'day spa', 'wellness'],
      qualifyingQuestions: {
        questions: [
          { id: 1, text: 'What wellness services do you offer?', type: 'text', weight: 10 },
          { id: 2, text: 'How many treatment rooms do you have?', type: 'number', weight: 15 },
          { id: 3, text: 'Do you sell retail products?', type: 'boolean', weight: 10 },
          { id: 4, text: 'Are you planning to add new services or equipment?', type: 'boolean', weight: 20 }
        ]
      },
      valueProposition: 'Wellness industry financing for equipment, facility expansion, and service diversification.',
      seasonalPatterns: { peak: ['Q1', 'Q4'], slow: ['Q3'] },
      crossSellOpportunities: ['MASSAGE_THERAPY', 'HAIR_SALON'],
      averageLoanSize: 55000,
      conversionRate: 0.13
    },
    // Automotive Services
    {
      industryType: IndustryType.AUTO_REPAIR,
      industryCategory: IndustryCategory.AUTOMOTIVE_SERVICES,
      displayName: 'Auto Repair Shop',
      minMonthlyRevenue: 12000,
      maxMonthlyRevenue: 90000,
      minYearsInBusiness: 1.0,
      searchTerms: ['auto repair', 'car repair', 'automotive service', 'mechanic', 'garage'],
      qualifyingQuestions: {
        questions: [
          { id: 1, text: 'What types of automotive services do you provide?', type: 'text', weight: 10 },
          { id: 2, text: 'How many service bays do you have?', type: 'number', weight: 15 },
          { id: 3, text: 'Do you work on fleet vehicles?', type: 'boolean', weight: 10 },
          { id: 4, text: 'Are you looking to upgrade diagnostic equipment?', type: 'boolean', weight: 20 }
        ]
      },
      valueProposition: 'Automotive industry financing for equipment upgrades, facility expansion, and inventory management.',
      seasonalPatterns: { peak: ['Q1', 'Q3'], slow: ['Q4'] },
      crossSellOpportunities: ['TIRE_SHOP', 'OIL_CHANGE'],
      averageLoanSize: 50000,
      conversionRate: 0.11
    },
    // Fitness & Recreation
    {
      industryType: IndustryType.GYM_FITNESS,
      industryCategory: IndustryCategory.FITNESS_RECREATION,
      displayName: 'Gym & Fitness Center',
      minMonthlyRevenue: 10000,
      maxMonthlyRevenue: 100000,
      minYearsInBusiness: 1.0,
      searchTerms: ['gym', 'fitness center', 'health club', 'workout', 'fitness studio'],
      qualifyingQuestions: {
        questions: [
          { id: 1, text: 'How many members do you currently have?', type: 'number', weight: 15 },
          { id: 2, text: 'What types of fitness equipment do you offer?', type: 'text', weight: 10 },
          { id: 3, text: 'Do you offer personal training services?', type: 'boolean', weight: 10 },
          { id: 4, text: 'Are you planning to expand or upgrade equipment?', type: 'boolean', weight: 20 }
        ]
      },
      valueProposition: 'Fitness industry financing for equipment purchases, facility expansion, and membership growth.',
      seasonalPatterns: { peak: ['Q1', 'Q2'], slow: ['Q4'] },
      crossSellOpportunities: ['YOGA_STUDIO', 'PERSONAL_TRAINING'],
      averageLoanSize: 70000,
      conversionRate: 0.14
    },
    // Pet Services
    {
      industryType: IndustryType.PET_GROOMING,
      industryCategory: IndustryCategory.PET_SERVICES,
      displayName: 'Pet Grooming Service',
      minMonthlyRevenue: 5000,
      maxMonthlyRevenue: 40000,
      minYearsInBusiness: 0.5,
      searchTerms: ['pet grooming', 'dog grooming', 'pet salon', 'groomer', 'pet care'],
      qualifyingQuestions: {
        questions: [
          { id: 1, text: 'How many pets do you groom per week?', type: 'number', weight: 15 },
          { id: 2, text: 'Do you offer mobile grooming services?', type: 'boolean', weight: 10 },
          { id: 3, text: 'What is your average service price?', type: 'number', weight: 10 },
          { id: 4, text: 'Are you looking to expand services or locations?', type: 'boolean', weight: 20 }
        ]
      },
      valueProposition: 'Pet industry financing for equipment, mobile units, and business expansion.',
      seasonalPatterns: { peak: ['Q2', 'Q4'], slow: ['Q1'] },
      crossSellOpportunities: ['PET_BOARDING', 'VETERINARY_SERVICES'],
      averageLoanSize: 25000,
      conversionRate: 0.17
    },
    // Specialty Retail
    {
      industryType: IndustryType.BOUTIQUE_CLOTHING,
      industryCategory: IndustryCategory.SPECIALTY_RETAIL,
      displayName: 'Boutique Clothing Store',
      minMonthlyRevenue: 8000,
      maxMonthlyRevenue: 60000,
      minYearsInBusiness: 0.5,
      searchTerms: ['boutique', 'clothing store', 'fashion', 'apparel', 'retail'],
      qualifyingQuestions: {
        questions: [
          { id: 1, text: 'What type of clothing do you specialize in?', type: 'text', weight: 10 },
          { id: 2, text: 'Do you have an online store?', type: 'boolean', weight: 10 },
          { id: 3, text: 'What is your average transaction amount?', type: 'number', weight: 15 },
          { id: 4, text: 'Are you looking to expand inventory or locations?', type: 'boolean', weight: 20 }
        ]
      },
      valueProposition: 'Retail financing solutions for inventory expansion, store renovations, and e-commerce growth.',
      seasonalPatterns: { peak: ['Q4'], slow: ['Q1'] },
      crossSellOpportunities: ['JEWELRY_STORE', 'GIFT_SHOP'],
      averageLoanSize: 30000,
      conversionRate: 0.12
    },
    // Business Services
    {
      industryType: IndustryType.ACCOUNTING_SERVICES,
      industryCategory: IndustryCategory.BUSINESS_SERVICES,
      displayName: 'Accounting Services',
      minMonthlyRevenue: 10000,
      maxMonthlyRevenue: 80000,
      minYearsInBusiness: 1.0,
      searchTerms: ['accounting', 'bookkeeping', 'tax services', 'CPA', 'financial services'],
      qualifyingQuestions: {
        questions: [
          { id: 1, text: 'How many clients do you currently serve?', type: 'number', weight: 15 },
          { id: 2, text: 'What accounting services do you offer?', type: 'text', weight: 10 },
          { id: 3, text: 'Do you provide tax preparation services?', type: 'boolean', weight: 10 },
          { id: 4, text: 'Are you looking to expand your practice or upgrade technology?', type: 'boolean', weight: 20 }
        ]
      },
      valueProposition: 'Professional services financing for technology upgrades, office expansion, and practice growth.',
      seasonalPatterns: { peak: ['Q1', 'Q4'], slow: ['Q3'] },
      crossSellOpportunities: ['LEGAL_SERVICES', 'CONSULTING'],
      averageLoanSize: 40000,
      conversionRate: 0.16
    }
  ];

  // Check if industry configs already exist
  const existingConfigs = await prisma.industryConfig.findMany();
  
  if (existingConfigs.length === 0) {
    for (const config of industryConfigs) {
      await prisma.industryConfig.create({
        data: config,
      });
    }
    console.log('✅ Industry configurations created');
  } else {
    console.log('✅ Industry configurations already exist, skipping creation');
  }

  // Create sample prospects from multiple industries
  const sampleProspects = [
    // Healthcare
    {
      businessName: 'Downtown Medical Center',
      contactName: 'Dr. Emily Rodriguez',
      email: 'erodriguez@downtownmedical.com',
      phone: '(555) 123-4567',
      address: '123 Main Street',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      businessType: IndustryType.MEDICAL_OFFICE,
      industryCategory: IndustryCategory.HEALTHCARE,
      monthlyRevenue: 45000,
      yearsInBusiness: 3.5,
      employeeCount: 12,
      website: 'https://downtownmedical.com',
      status: ProspectStatus.NEW,
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
      businessType: IndustryType.DENTAL_PRACTICE,
      industryCategory: IndustryCategory.HEALTHCARE,
      monthlyRevenue: 32000,
      yearsInBusiness: 2.0,
      employeeCount: 8,
      website: 'https://brightsmiles.com',
      status: ProspectStatus.CONTACTED,
      qualificationScore: 75,
      isQualified: true,
      notes: 'Growing dental practice. Owner interested in expansion financing.',
      tags: ['dental', 'expansion', 'san-francisco'],
      source: 'LinkedIn Outreach',
      assignedToId: managerUser.id,
    },
    // Restaurants & Food Service
    {
      businessName: 'Tony\'s Pizza Express',
      contactName: 'Tony Marinelli',
      email: 'tony@tonyspizza.com',
      phone: '(555) 345-6789',
      address: '789 Pizza Boulevard',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      businessType: IndustryType.FAST_FOOD,
      industryCategory: IndustryCategory.RESTAURANT_FOOD_SERVICE,
      monthlyRevenue: 28000,
      yearsInBusiness: 2.5,
      employeeCount: 15,
      website: 'https://tonyspizza.com',
      status: ProspectStatus.QUALIFIED,
      qualificationScore: 78,
      isQualified: true,
      notes: 'Popular pizza place looking to expand to second location.',
      tags: ['fast-food', 'expansion', 'chicago'],
      source: 'Cold Outreach',
      assignedToId: regularUser.id,
    },
    {
      businessName: 'The Garden Bistro',
      contactName: 'Maria Santos',
      email: 'maria@gardenbistro.com',
      phone: '(555) 456-7890',
      address: '321 Garden Street',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      businessType: IndustryType.CASUAL_DINING,
      industryCategory: IndustryCategory.RESTAURANT_FOOD_SERVICE,
      monthlyRevenue: 42000,
      yearsInBusiness: 3.0,
      employeeCount: 22,
      website: 'https://gardenbistro.com',
      status: ProspectStatus.NURTURING,
      qualificationScore: 82,
      isQualified: true,
      notes: 'Farm-to-table restaurant interested in kitchen equipment upgrade.',
      tags: ['casual-dining', 'equipment', 'portland'],
      source: 'Referral',
      assignedToId: testUser.id,
    },
    // Beauty & Wellness
    {
      businessName: 'Bella Hair Studio',
      contactName: 'Isabella Rodriguez',
      email: 'bella@bellahair.com',
      phone: '(555) 567-8901',
      address: '654 Beauty Lane',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      businessType: IndustryType.HAIR_SALON,
      industryCategory: IndustryCategory.BEAUTY_WELLNESS,
      monthlyRevenue: 18000,
      yearsInBusiness: 1.5,
      employeeCount: 8,
      website: 'https://bellahair.com',
      status: ProspectStatus.CONTACTED,
      qualificationScore: 70,
      isQualified: true,
      notes: 'Growing salon wants to add spa services.',
      tags: ['hair-salon', 'expansion', 'miami'],
      source: 'Social Media',
      assignedToId: managerUser.id,
    },
    {
      businessName: 'Zen Day Spa',
      contactName: 'Jennifer Lee',
      email: 'jen@zendayspa.com',
      phone: '(555) 678-9012',
      address: '987 Wellness Way',
      city: 'Santa Barbara',
      state: 'CA',
      zipCode: '93101',
      businessType: IndustryType.SPA_WELLNESS,
      industryCategory: IndustryCategory.BEAUTY_WELLNESS,
      monthlyRevenue: 35000,
      yearsInBusiness: 4.0,
      employeeCount: 14,
      website: 'https://zendayspa.com',
      status: ProspectStatus.SUBMITTED,
      qualificationScore: 88,
      isQualified: true,
      notes: 'Established spa applying for renovation financing.',
      tags: ['spa', 'renovation', 'santa-barbara'],
      source: 'Trade Show',
      assignedToId: testUser.id,
    },
    // Automotive Services
    {
      businessName: 'Mike\'s Auto Repair',
      contactName: 'Mike Johnson',
      email: 'mike@mikesauto.com',
      phone: '(555) 789-0123',
      address: '147 Mechanic Street',
      city: 'Detroit',
      state: 'MI',
      zipCode: '48201',
      businessType: IndustryType.AUTO_REPAIR,
      industryCategory: IndustryCategory.AUTOMOTIVE_SERVICES,
      monthlyRevenue: 22000,
      yearsInBusiness: 6.0,
      employeeCount: 10,
      website: 'https://mikesauto.com',
      status: ProspectStatus.NEW,
      qualificationScore: 75,
      isQualified: true,
      notes: 'Established auto shop needing diagnostic equipment upgrade.',
      tags: ['auto-repair', 'equipment', 'detroit'],
      source: 'Google Search',
      assignedToId: regularUser.id,
    },
    // Fitness & Recreation
    {
      businessName: 'PowerFit Gym',
      contactName: 'David Thompson',
      email: 'david@powerfitgym.com',
      phone: '(555) 890-1234',
      address: '258 Fitness Boulevard',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      businessType: IndustryType.GYM_FITNESS,
      industryCategory: IndustryCategory.FITNESS_RECREATION,
      monthlyRevenue: 38000,
      yearsInBusiness: 2.0,
      employeeCount: 18,
      website: 'https://powerfitgym.com',
      status: ProspectStatus.QUALIFIED,
      qualificationScore: 85,
      isQualified: true,
      notes: 'Growing fitness center ready to expand equipment offerings.',
      tags: ['gym', 'equipment', 'austin'],
      source: 'Industry Publication',
      assignedToId: testUser.id,
    },
    // Pet Services
    {
      businessName: 'Pampered Paws Grooming',
      contactName: 'Sarah Wilson',
      email: 'sarah@pamperedpaws.com',
      phone: '(555) 901-2345',
      address: '369 Pet Lane',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      businessType: IndustryType.PET_GROOMING,
      industryCategory: IndustryCategory.PET_SERVICES,
      monthlyRevenue: 12000,
      yearsInBusiness: 1.8,
      employeeCount: 5,
      website: 'https://pamperedpaws.com',
      status: ProspectStatus.CONTACTED,
      qualificationScore: 68,
      isQualified: true,
      notes: 'Pet grooming service looking to add mobile grooming van.',
      tags: ['pet-grooming', 'mobile-service', 'denver'],
      source: 'Local Business Directory',
      assignedToId: managerUser.id,
    },
    // Specialty Retail
    {
      businessName: 'Threads Boutique',
      contactName: 'Lisa Martinez',
      email: 'lisa@threadsboutique.com',
      phone: '(555) 012-3456',
      address: '741 Fashion Street',
      city: 'Nashville',
      state: 'TN',
      zipCode: '37201',
      businessType: IndustryType.BOUTIQUE_CLOTHING,
      industryCategory: IndustryCategory.SPECIALTY_RETAIL,
      monthlyRevenue: 15000,
      yearsInBusiness: 2.5,
      employeeCount: 6,
      website: 'https://threadsboutique.com',
      status: ProspectStatus.NEW,
      qualificationScore: 72,
      isQualified: true,
      notes: 'Fashion boutique wants to expand online presence and inventory.',
      tags: ['boutique', 'online-expansion', 'nashville'],
      source: 'Fashion Trade Show',
      assignedToId: regularUser.id,
    },
    // Business Services
    {
      businessName: 'TaxPro Accounting',
      contactName: 'Robert Chen',
      email: 'robert@taxpro.com',
      phone: '(555) 123-4567',
      address: '852 Business Park Drive',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      businessType: IndustryType.ACCOUNTING_SERVICES,
      industryCategory: IndustryCategory.BUSINESS_SERVICES,
      monthlyRevenue: 28000,
      yearsInBusiness: 5.5,
      employeeCount: 12,
      website: 'https://taxpro.com',
      status: ProspectStatus.CONVERTED,
      qualificationScore: 92,
      isQualified: true,
      notes: 'Successfully funded office expansion. Excellent payment history.',
      tags: ['accounting', 'funded', 'phoenix'],
      source: 'CPA Association',
      assignedToId: testUser.id,
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

  // Create multi-industry email templates
  const emailTemplates = [
    {
      name: 'Initial Contact - Universal',
      subject: 'Business Financing Solutions for {{businessName}}',
      content: `Hi {{contactName}},

I hope this message finds you well. My name is {{senderName}} from PipelinePro OS, and I specialize in helping businesses like {{businessName}} access the capital they need to grow and thrive.

I noticed your business and was impressed by your commitment to serving your community. Many business owners are finding that having access to flexible financing options helps them:

• Upgrade equipment and technology
• Expand their business or add new services
• Improve cash flow during seasonal fluctuations
• Take advantage of growth opportunities
• Invest in marketing and customer acquisition

Would you be interested in a brief conversation about how we might be able to support {{businessName}}'s financial goals? I'd be happy to discuss options that could work for your specific industry and situation.

Best regards,
{{senderName}}
{{senderTitle}}
PipelinePro OS
{{senderPhone}}
{{senderEmail}}`,
      type: 'initial_contact',
      isActive: true,
      createdById: testUser.id,
    },
    {
      name: 'Follow-up Email - Multi-Industry',
      subject: 'Following up on financing options for {{businessName}}',
      content: `Hi {{contactName}},

I wanted to follow up on my previous message regarding financing solutions for {{businessName}}.

I understand that as a business owner, your time is incredibly valuable, and I don't want to take up too much of it. However, I believe we might have some financing options that could be beneficial for your business.

Our clients across various industries have used our services to:
• Finance new equipment purchases
• Support business expansion
• Improve working capital
• Consolidate existing debt
• Fund inventory purchases
• Renovate facilities

Would you have 10 minutes this week for a brief phone conversation? I'm confident I can provide some valuable insights specific to businesses in your industry.

Looking forward to hearing from you.

Best regards,
{{senderName}}`,
      type: 'follow_up',
      isActive: true,
      createdById: testUser.id,
    },
    {
      name: 'Industry-Specific Qualification',
      subject: 'Quick questions about {{businessName}}',
      content: `Hi {{contactName}},

Thank you for your interest in our financing solutions for {{businessName}}.

To better understand how we can best serve your needs, I'd like to ask a few quick questions:

1. What is your primary goal for seeking financing? (equipment, expansion, working capital, etc.)
2. What is your approximate monthly revenue?
3. How long has your business been in operation?
4. Do you currently have any existing business debt?
5. What are your biggest challenges in growing your business?

This information will help me recommend the most suitable financing options for your industry and situation. All information is kept strictly confidential.

Would you prefer to discuss these over a brief phone call, or would you be comfortable responding via email?

Best regards,
{{senderName}}`,
      type: 'qualification',
      isActive: true,
      createdById: managerUser.id,
    },
    {
      name: 'Industry-Specific Value Proposition',
      subject: 'Financing solutions tailored for {{industryType}} businesses',
      content: `Hi {{contactName}},

I specialize in working with {{industryType}} businesses and understand the unique challenges and opportunities in your industry.

Here's how we've helped similar businesses:
{{industrySpecificExamples}}

Our financing solutions are designed to work with the seasonal patterns and cash flow cycles common in your industry. We offer:
• Fast approval processes (as quick as 24-48 hours)
• Flexible payment terms that align with your business cycle
• No early payment penalties
• Use of funds for any business purpose

I'd love to discuss how we can specifically help {{businessName}} achieve its growth goals.

Best regards,
{{senderName}}`,
      type: 'industry_specific',
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

  // Create sample search sessions
  const sampleSearchSessions = [
    {
      userId: testUser.id,
      searchQuery: 'restaurants near downtown',
      industryFilters: [IndustryType.FAST_FOOD, IndustryType.CASUAL_DINING],
      locationFilters: ['Los Angeles, CA', 'San Francisco, CA'],
      revenueMin: 20000,
      revenueMax: 100000,
      resultsCount: 15,
      dataSource: 'live',
      isCompleted: true,
      searchDuration: 45,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      userId: managerUser.id,
      searchQuery: 'beauty salons',
      industryFilters: [IndustryType.HAIR_SALON, IndustryType.SPA_WELLNESS],
      locationFilters: ['Miami, FL'],
      revenueMin: 15000,
      revenueMax: 80000,
      resultsCount: 12,
      dataSource: 'mixed',
      isCompleted: true,
      searchDuration: 32,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      userId: regularUser.id,
      searchQuery: 'automotive services',
      industryFilters: [IndustryType.AUTO_REPAIR, IndustryType.TIRE_SHOP],
      locationFilters: ['Detroit, MI', 'Chicago, IL'],
      revenueMin: 18000,
      revenueMax: 90000,
      resultsCount: 8,
      dataSource: 'live',
      isCompleted: true,
      searchDuration: 28,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  ];

  for (const sessionData of sampleSearchSessions) {
    await prisma.searchSession.create({
      data: sessionData,
    });
  }

  console.log('✅ Sample search sessions created');

  // Create sample bulk operations
  const sampleBulkOperations = [
    {
      userId: testUser.id,
      operationType: BulkOperationType.BULK_SEARCH,
      targetIndustries: [IndustryType.FAST_FOOD, IndustryType.CASUAL_DINING, IndustryType.COFFEE_SHOP],
      targetLocations: ['California', 'Texas', 'Florida'],
      status: BulkOperationStatus.COMPLETED,
      totalTargets: 50,
      completedTargets: 48,
      failedTargets: 2,
      parameters: {
        revenueRange: { min: 15000, max: 100000 },
        yearsInBusiness: { min: 1.0 },
        searchTerms: ['restaurant', 'food service', 'dining']
      },
      results: {
        prospectsFound: 48,
        qualifiedProspects: 32,
        averageRevenue: 45000
      },
      scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
    {
      userId: managerUser.id,
      operationType: BulkOperationType.INDUSTRY_ANALYSIS,
      targetIndustries: [IndustryType.HAIR_SALON, IndustryType.SPA_WELLNESS, IndustryType.NAIL_SALON],
      targetLocations: ['New York', 'California', 'Florida'],
      status: BulkOperationStatus.COMPLETED,
      totalTargets: 25,
      completedTargets: 25,
      failedTargets: 0,
      parameters: {
        analysisType: 'market_penetration',
        timeframe: 'Q4_2024'
      },
      results: {
        marketSize: 1250,
        penetrationRate: 0.08,
        avgConversionRate: 0.14,
        seasonalTrends: ['Q4_peak', 'Q1_slow']
      },
      scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const operationData of sampleBulkOperations) {
    await prisma.bulkOperation.create({
      data: operationData,
    });
  }

  console.log('✅ Sample bulk operations created');
  console.log('🎉 PipelinePro OS database seeding completed successfully!');
  
  console.log('\n📋 Test Accounts Created:');
  console.log('Admin: john@doe.com / johndoe123');
  console.log('Manager: manager@ccc.com / manager123');
  console.log('User: user@ccc.com / user123');
  
  console.log('\n🏭 Industry Categories Configured:');
  console.log('• Healthcare (3 business types)');
  console.log('• Restaurants & Food Service (2 business types)');
  console.log('• Beauty & Wellness (2 business types)');
  console.log('• Automotive Services (1 business type)');
  console.log('• Fitness & Recreation (1 business type)');
  console.log('• Pet Services (1 business type)');
  console.log('• Specialty Retail (1 business type)');
  console.log('• Business Services (1 business type)');
  
  console.log('\n📊 Sample Data Created:');
  console.log('• 12 multi-industry prospects');
  console.log('• 4 industry-agnostic email templates');
  console.log('• 3 search sessions with industry filters');
  console.log('• 2 bulk operations (search & analysis)');
  console.log('• 12 industry configurations with qualification criteria');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
