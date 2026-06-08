import { PrismaClient } from '@prisma/client';
import { Role, DonationStatus, VolunteerStatus } from '../src/types/enums';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.notification.deleteMany({});
  await prisma.deliveryProof.deleteMany({});
  await prisma.deliveryTracking.deleteMany({});
  await prisma.deliveryAssignment.deleteMany({});
  await prisma.donation.deleteMany({});
  await prisma.hospital.deleteMany({});
  await prisma.needyLocation.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.individualDonor.deleteMany({});
  await prisma.volunteer.deleteMany({});
  await prisma.ngo.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.donationSchedule.deleteMany({});
  await prisma.communityFridge.deleteMany({});
  await prisma.volunteerAchievement.deleteMany({});
  await prisma.referral.deleteMany({});
  await prisma.coldStorage.deleteMany({});

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@foodbridge.org',
      password: hashedPassword,
      role: Role.ADMIN,
      status: 'APPROVED',
    },
  });

  const hotelUser = await prisma.user.create({
    data: {
      email: 'grandplaza@hotel.com',
      password: hashedPassword,
      role: Role.ORGANIZATION_DONOR,
      status: 'APPROVED',
    },
  });

  const individualUser = await prisma.user.create({
    data: {
      email: 'sarah@donor.com',
      password: hashedPassword,
      role: Role.INDIVIDUAL_DONOR,
      status: 'APPROVED',
    },
  });

  const volunteerUser = await prisma.user.create({
    data: {
      email: 'john@volunteer.com',
      password: hashedPassword,
      role: Role.VOLUNTEER,
      status: 'APPROVED',
    },
  });

  const ngoUser = await prisma.user.create({
    data: {
      email: 'hope@ngo.org',
      password: hashedPassword,
      role: Role.NGO,
      status: 'APPROVED',
    },
  });

  console.log('Users created.');

  // 2. Create User Profiles
  const hotelProfile = await prisma.organization.create({
    data: {
      userId: hotelUser.id,
      name: 'Grand Plaza Hotel',
      contactPerson: 'Marcus Vance',
      mobile: '+15550199',
      address: 'Ramanuja Circle, Tirupati, Andhra Pradesh 517501',
      orgType: 'Hotel',
      openingTime: '06:00',
      closingTime: '23:00',
      logoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150',
    },
  });

  const individualProfile = await prisma.individualDonor.create({
    data: {
      userId: individualUser.id,
      fullName: 'Sarah Jenkins',
      mobile: '+15550188',
      address: 'Bairagipatteda, Tirupati, Andhra Pradesh 517501',
      profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  const volunteerProfile = await prisma.volunteer.create({
    data: {
      userId: volunteerUser.id,
      fullName: 'John Doe',
      mobile: '+15550177',
      address: 'MR Palli, Tirupati, Andhra Pradesh 517502',
      city: 'Tirupati',
      district: 'Chittoor',
      state: 'Andhra Pradesh',
      pincode: '517502',
      currentLat: 13.6288,
      currentLng: 79.4192,
      gender: 'Male',
      dob: '1995-08-15',
      govIdNumber: 'DL-987654321',
      vehicleType: 'Bike',
      vehicleNumber: 'IL-56-AB-1234',
      availability: 'Evening',
      status: VolunteerStatus.AVAILABLE,
      profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  });

  const ngoProfile = await prisma.ngo.create({
    data: {
      userId: ngoUser.id,
      name: 'Hope Foundation',
      contactPerson: 'Elena Rostova',
      mobile: '+15550166',
      address: 'Balaji Colony, Tirupati, Andhra Pradesh 517501',
      logoUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=150',
    },
  });

  console.log('Profiles created.');

  // 3. Create Hospitals and Needy Locations
  const hospital1 = await prisma.hospital.create({
    data: {
      name: 'RUIA Hospital',
      address: 'Alipiri Road, Tirupati, Andhra Pradesh 517507',
      contactPerson: 'Dr. Julius Hibbert',
      mobile: '+15550111',
    },
  });

  const hospital2 = await prisma.hospital.create({
    data: {
      name: 'Mercy Children\'s Hospital',
      address: 'Tirupati, Andhra Pradesh 517507',
      contactPerson: 'Nurse Ratched',
      mobile: '+15550122',
    },
  });

  const needyLocation1 = await prisma.needyLocation.create({
    data: {
      name: 'Tirumala Bypass Road Community Shelter',
      address: 'Tirumala Bypass Road, Tirupati, Andhra Pradesh 517501',
      description: 'Provides temporary shelter and services to homeless individuals.',
      contactPerson: 'Leon Vance',
      mobile: '+15550133',
    },
  });

  const needyLocation2 = await prisma.needyLocation.create({
    data: {
      name: 'Korlagunta Community Center',
      address: 'Korlagunta, Tirupati, Andhra Pradesh 517501',
      description: 'Serving hot meals to low-income families and children daily.',
      contactPerson: 'Maria Lopez',
      mobile: '+15550144',
    },
  });

  console.log('Hospitals and Needy Locations created.');

  // 4. Create Sample Donations
  // Donation 1: Completed
  const donation1 = await prisma.donation.create({
    data: {
      orgDonorId: hotelProfile.id,
      foodName: 'Leftover Rice & Curry Buffet',
      description: 'Basmati rice, chicken curry, paneer butter masala, naan. Unused from dinner event.',
      category: 'Mixed',
      quantity: 50,
      readyTime: '2026-06-04T10:00:00Z',
      expiryTime: '2026-06-04T22:00:00Z',
      pickupAddress: hotelProfile.address,
      status: DonationStatus.VERIFIED,
      notes: 'Please bring containers if possible.',
    },
  });

  const assignment1 = await prisma.deliveryAssignment.create({
    data: {
      donationId: donation1.id,
      ngoId: ngoProfile.id,
      volunteerId: volunteerProfile.id,
      destinationType: 'SHELTER',
      destinationName: needyLocation1.name,
      destinationAddress: needyLocation1.address,
      needyLocationId: needyLocation1.id,
      status: VolunteerStatus.DELIVERED,
    },
  });

  await prisma.deliveryProof.create({
    data: {
      assignmentId: assignment1.id,
      photoUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500',
      recipientPhotoUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=150',
      notes: 'Delivered successfully to the Tirumala Bypass Road Community Shelter. 50 meals provided.',
      verified: true,
      verifiedAt: new Date(),
    },
  });

  // Donation 2: Active / Assigned to volunteer
  const donation2 = await prisma.donation.create({
    data: {
      orgDonorId: hotelProfile.id,
      foodName: 'Assorted Pastries & Sandwiches',
      description: 'Fresh vegetarian sandwiches, donuts, croissants from our morning bakery stock.',
      category: 'Vegetarian',
      quantity: 30,
      readyTime: '2026-06-04T12:00:00Z',
      expiryTime: '2026-06-04T20:00:00Z',
      pickupAddress: hotelProfile.address,
      status: DonationStatus.ASSIGNED,
      notes: 'Pastries are pre-packed in boxes.',
    },
  });

  const assignment2 = await prisma.deliveryAssignment.create({
    data: {
      donationId: donation2.id,
      ngoId: ngoProfile.id,
      volunteerId: volunteerProfile.id,
      destinationType: 'HOSPITAL',
      destinationName: hospital1.name,
      destinationAddress: hospital1.address,
      hospitalId: hospital1.id,
      status: VolunteerStatus.FOOD_PICKED_UP,
    },
  });

  // Add initial tracking coordinate
  await prisma.deliveryTracking.create({
    data: {
      assignmentId: assignment2.id,
      latitude: 13.6250,
      longitude: 79.4200,
    },
  });

  // Donation 3: Pending NGO Assignment
  await prisma.donation.create({
    data: {
      indDonorId: individualProfile.id,
      foodName: 'Homecooked Veggie Biryani',
      description: 'Prepared a large quantity of Vegetable Biryani for a home party but guests couldn\'t make it. Tastes great, packed in aluminum foil.',
      category: 'Vegetarian',
      quantity: 15,
      readyTime: '2026-06-04T13:00:00Z',
      expiryTime: '2026-06-04T23:00:00Z',
      pickupAddress: individualProfile.address,
      status: DonationStatus.PENDING,
      notes: 'Keep it hot if possible.',
    },
  });

  console.log('Sample donations and assignments seeded.');

  // Seeding new tables
  await prisma.donationSchedule.create({
    data: {
      donorId: hotelProfile.id,
      frequency: 'WEEKLY',
      dayOfWeek: 'Wednesday',
      pickupTime: '18:00',
      foodName: 'Excess Buffet Rice & Gravy',
      category: 'Mixed',
      quantity: 40,
      active: true,
    }
  });

  await prisma.donationSchedule.create({
    data: {
      donorId: individualProfile.id,
      frequency: 'DAILY',
      pickupTime: '21:00',
      foodName: 'Leftover Roti & Dal',
      category: 'Vegetarian',
      quantity: 10,
      active: true,
    }
  });

  await prisma.communityFridge.create({
    data: {
      name: 'SVIMS Gate Community Fridge',
      location: 'SVIMS Main Gate, Tirupati, Andhra Pradesh 517507',
      latitude: 13.6265,
      longitude: 79.4085,
      capacity: 50,
      currentMeals: 12,
      lastRefillTime: new Date(),
      status: 'ACTIVE'
    }
  });

  await prisma.communityFridge.create({
    data: {
      name: 'RUIA Hospital Canteen Fridge',
      location: 'RUIA OPD Road, Tirupati, Andhra Pradesh 517507',
      latitude: 13.6288,
      longitude: 79.4045,
      capacity: 80,
      currentMeals: 35,
      lastRefillTime: new Date(),
      status: 'ACTIVE'
    }
  });

  await prisma.communityFridge.create({
    data: {
      name: 'Alipiri Footpath Fridge',
      location: 'Alipiri Toll Gate Shelter, Tirupati, Andhra Pradesh 517507',
      latitude: 13.6420,
      longitude: 79.4055,
      capacity: 40,
      currentMeals: 0,
      lastRefillTime: new Date(),
      status: 'MAINTENANCE'
    }
  });

  await prisma.volunteerAchievement.create({
    data: {
      volunteerId: volunteerProfile.id,
      deliveries: 18,
      distance: 42.5,
      hours: 12.0,
      points: 450,
      badges: JSON.stringify(['Gold Star', 'Speedy Delivery', 'Tirupati Savior'])
    }
  });

  await prisma.referral.create({
    data: {
      referrerId: hotelProfile.id,
      referredEmail: 'spicesofindia@restaurant.com',
      role: 'ORGANIZATION_DONOR',
      status: 'JOINED',
      rewardPoints: 100,
    }
  });

  await prisma.referral.create({
    data: {
      referrerId: individualProfile.id,
      referredEmail: 'friend@donor.com',
      role: 'INDIVIDUAL_DONOR',
      status: 'PENDING',
      rewardPoints: 0,
    }
  });

  await prisma.coldStorage.create({
    data: {
      name: 'Tirupati Cold Chain Hub A',
      location: 'Renigunta Road Industrial Estate, Tirupati, AP 517501',
      temperature: 3.5,
      capacity: 500,
      currentMeals: 150,
      expiryAlerts: false
    }
  });

  await prisma.coldStorage.create({
    data: {
      name: 'SVMC Cold Chain Storage',
      location: 'SV Medical College Ground, Tirupati, AP 517507',
      temperature: 7.2,
      capacity: 300,
      currentMeals: 220,
      expiryAlerts: true
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
