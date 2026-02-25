// ===========================================
// LIFELINK - Database Seed Script
// ===========================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding LifeLink database...');

  // Create Super Admin
  const adminPassword = await bcrypt.hash('Admin@LifeLink2026!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lifelink.co.ke' },
    update: {},
    create: {
      email: 'admin@lifelink.co.ke',
      phone: '+254724 927304',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
      isVerified: true,
      profile: {
        create: {
          firstName: 'LifeLink',
          lastName: 'Administrator',
          city: 'Nairobi',
          county: 'Nairobi',
        },
      },
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Create sample doctors
  const doctorPassword = await bcrypt.hash('Doctor@LifeLink2026!', 12);
  
  const doctorData = [
    {
      email: 'dr.wanjiku@lifelink.co.ke',
      phone: '+254724 927304',
      firstName: 'Wanjiku',
      lastName: 'Kamau',
      specialization: ['Psychiatry', 'Depression', 'Anxiety'],
      qualifications: ['MBChB', 'MMed Psychiatry'],
      yearsOfExperience: 12,
      consultationFee: 5000,
      teleHealthFee: 4000,
      bio: 'Board-certified psychiatrist specializing in mood disorders and anxiety with over 12 years of experience.',
    },
    {
      email: 'dr.odhiambo@lifelink.co.ke',
      phone: '+254724 927304',
      firstName: 'Brian',
      lastName: 'Odhiambo',
      specialization: ['Clinical Psychology', 'Trauma', 'PTSD'],
      qualifications: ['PhD Clinical Psychology', 'BSc Psychology'],
      yearsOfExperience: 8,
      consultationFee: 4500,
      teleHealthFee: 3500,
      bio: 'Clinical psychologist with expertise in trauma-focused therapy and PTSD treatment.',
    },
    {
      email: 'dr.mwangi@lifelink.co.ke',
      phone: '+254724 927304',
      firstName: 'Grace',
      lastName: 'Mwangi',
      specialization: ['Family Therapy', 'Couples Counseling', 'Child Psychology'],
      qualifications: ['MA Counseling Psychology', 'BA Psychology'],
      yearsOfExperience: 10,
      consultationFee: 4000,
      teleHealthFee: 3000,
      bio: 'Licensed family therapist with a passion for strengthening family bonds and child development.',
    },
  ];

  for (const doc of doctorData) {
    const user = await prisma.user.upsert({
      where: { email: doc.email },
      update: {},
      create: {
        email: doc.email,
        phone: doc.phone,
        passwordHash: doctorPassword,
        role: 'DOCTOR',
        isActive: true,
        isVerified: true,
        profile: {
          create: {
            firstName: doc.firstName,
            lastName: doc.lastName,
            city: 'Nairobi',
            county: 'Nairobi',
          },
        },
        doctor: {
          create: {
            licenseNumber: `KMD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            specialization: doc.specialization,
            qualifications: doc.qualifications,
            yearsOfExperience: doc.yearsOfExperience,
            consultationFee: doc.consultationFee,
            teleHealthFee: doc.teleHealthFee,
            bio: doc.bio,
          },
        },
      },
    });
    console.log('✅ Doctor created:', user.email);

    // Create availability slots
    const doctor = await prisma.doctor.findFirst({ where: { userId: user.id } });
    if (doctor) {
      for (let day = 1; day <= 5; day++) { // Monday to Friday
        await prisma.availabilitySlot.createMany({
          data: [
            { doctorId: doctor.id, dayOfWeek: day, startTime: '09:00', endTime: '12:00', slotType: 'IN_PERSON' },
            { doctorId: doctor.id, dayOfWeek: day, startTime: '14:00', endTime: '17:00', slotType: 'TELEHEALTH' },
          ],
        });
      }
    }
  }

  // Create services
  const services = [
    { name: 'Individual Therapy', slug: 'individual-therapy', description: 'One-on-one therapy sessions tailored to your unique needs.', longDescription: 'Our individual therapy sessions provide a safe, confidential space to explore your thoughts, feelings, and behaviors. Our therapists use evidence-based approaches to help you overcome challenges and achieve personal growth.', category: 'therapy', price: 4500, duration: 50, isFeatured: true, sortOrder: 1 },
    { name: 'Psychiatric Consultation', slug: 'psychiatric-consultation', description: 'Expert psychiatric assessment and medication management.', longDescription: 'Comprehensive psychiatric evaluation, diagnosis, and medication management provided by our board-certified psychiatrists.', category: 'psychiatry', price: 5000, duration: 60, isFeatured: true, sortOrder: 2 },
    { name: 'Couples Therapy', slug: 'couples-therapy', description: 'Strengthen your relationship through guided couples therapy.', longDescription: 'Our couples therapy helps partners improve communication, resolve conflicts, and deepen their connection in a supportive environment.', category: 'therapy', price: 6000, duration: 60, isFeatured: true, sortOrder: 3 },
    { name: 'Family Therapy', slug: 'family-therapy', description: 'Improve family dynamics and resolve complex family issues.', category: 'therapy', price: 6000, duration: 60, isFeatured: false, sortOrder: 4 },
    { name: 'Child & Adolescent Therapy', slug: 'child-adolescent-therapy', description: 'Specialized therapy for children and teens.', category: 'child', price: 4000, duration: 45, isFeatured: false, sortOrder: 5 },
    { name: 'Trauma & PTSD Therapy', slug: 'trauma-ptsd-therapy', description: 'Specialized treatment for trauma and PTSD recovery.', category: 'therapy', price: 5000, duration: 50, isFeatured: true, sortOrder: 6 },
    { name: 'Addiction Counseling', slug: 'addiction-counseling', description: 'Professional support for substance use and behavioral addictions.', category: 'therapy', price: 4500, duration: 50, isFeatured: false, sortOrder: 7 },
    { name: 'Corporate Wellness', slug: 'corporate-wellness', description: 'Comprehensive mental health programs for organizations.', category: 'corporate', price: null, duration: null, isFeatured: true, sortOrder: 8 },
    { name: 'Online Therapy', slug: 'online-therapy', description: 'Secure telehealth sessions from the comfort of your home.', category: 'telehealth', price: 3500, duration: 50, isFeatured: true, sortOrder: 9 },
    { name: 'Group Therapy', slug: 'group-therapy', description: 'Supportive group sessions for shared healing.', category: 'therapy', price: 2000, duration: 90, isFeatured: false, sortOrder: 10 },
  ];

  for (const svc of services) {
    await prisma.service.upsert({
      where: { slug: svc.slug },
      update: {},
      create: svc,
    });
  }
  console.log('✅ Services created');

  // Create sample blog posts
  const blogPosts = [
    {
      title: 'Understanding Depression in Kenya: A Comprehensive Guide',
      slug: 'understanding-depression-in-kenya',
      excerpt: 'Depression affects millions of Kenyans. Learn about the signs, causes, and treatment options available.',
      content: 'Depression is one of the most common mental health conditions globally, and Kenya is no exception. According to the World Health Organization, approximately 4.4% of the Kenyan population suffers from depression...',
      category: 'Mental Health',
      tags: ['depression', 'mental health', 'kenya', 'wellness'],
      author: admin.id,
      isPublished: true,
      publishedAt: new Date(),
      metaTitle: 'Understanding Depression in Kenya | LifeLink Mental Wellness Solution',
      metaDescription: 'Learn about depression signs, causes, and treatment options available in Kenya. Expert guidance from LifeLink.',
    },
    {
      title: 'The Rise of Telehealth in East Africa',
      slug: 'rise-of-telehealth-east-africa',
      excerpt: 'How digital health solutions are transforming mental healthcare access in East Africa.',
      content: 'The COVID-19 pandemic accelerated the adoption of telehealth services across East Africa. Today, platforms like LifeLink are making quality mental healthcare accessible to millions...',
      category: 'Technology',
      tags: ['telehealth', 'technology', 'east africa', 'digital health'],
      author: admin.id,
      isPublished: true,
      publishedAt: new Date(),
      metaTitle: 'Telehealth in East Africa | LifeLink Mental Wellness Solution',
      metaDescription: 'Discover how telehealth is transforming mental healthcare in East Africa.',
    },
    {
      title: '5 Mental Health Tips for Kenya\'s Corporate Professionals',
      slug: 'mental-health-tips-corporate-professionals',
      excerpt: 'Practical strategies for managing stress and maintaining mental wellness in the workplace.',
      content: 'Corporate professionals in Kenya face unique pressures that can impact mental health. From demanding work schedules to economic challenges, maintaining mental wellness requires intentional effort...',
      category: 'Workplace Wellness',
      tags: ['corporate wellness', 'stress management', 'workplace', 'tips'],
      author: admin.id,
      isPublished: true,
      publishedAt: new Date(),
      metaTitle: 'Mental Health Tips for Corporate Professionals | LifeLink',
      metaDescription: 'Practical mental health strategies for Kenya\'s corporate professionals.',
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }
  console.log('✅ Blog posts created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Login Credentials:');
  console.log(`   Admin: admin@lifelink.co.ke / Admin@LifeLink2026!`);
  console.log(`   Doctors: dr.wanjiku@lifelink.co.ke / Doctor@LifeLink2026!`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
