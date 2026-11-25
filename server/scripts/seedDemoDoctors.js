require('dotenv').config({ quiet: true });
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

const specializations = [
  'General Veterinary Care', 'Small Animal Surgery', 'Pet Nutrition',
  'Veterinary Dentistry', 'Veterinary Dermatology', 'Feline Medicine',
  'Canine Medicine', 'Preventive Care', 'Veterinary Orthopedics',
  'Senior Pet Care'
];

async function seed() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI missing');
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  await Promise.all([User.init(), Doctor.init()]);
  let created = 0;
  for (let index = 0; index < specializations.length; index += 1) {
    const number = String(index + 1).padStart(2, '0');
    const email = `ai-vet-demo-${number}@example.invalid`;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        fullName: `Demo Doctor ${number} (Fictional)`,
        email,
        role: 'vet'
      });
    }
    if (user.role !== 'vet' || !user.fullName.startsWith('Demo Doctor')) {
      throw new Error('Demo email belongs to a different account; no overwrite performed');
    }
    if (await Doctor.exists({ user: user._id })) continue;
    await Doctor.create({
      user: user._id,
      specialization: specializations[index],
      qualifications: ['Demo qualification - not a licensed practitioner'],
      experienceYears: 0,
      licenseNumber: `DEMO-NOT-A-REAL-LICENSE-${number}`,
      consultationFee: 0,
      clinicName: `Demo Clinic ${number} (Fictional)`,
      clinicAddress: {
        addressLine: 'Fictional address - demonstration only',
        city: 'Demo City', state: 'Demo State', postalCode: '000000'
      },
      bio: 'Fictional sample profile for UI testing. Not a real veterinarian. Appointments unavailable.',
      languages: ['English', 'Hindi'],
      isDemo: true,
      isVerified: false,
      isActive: true
    });
    created += 1;
  }
  console.log(JSON.stringify({ created, totalDemoDoctors: await Doctor.countDocuments({ isDemo: true }) }));
}

seed().catch((error) => {
  console.error('Demo seed failed. Check database connectivity and existing demo records. Secrets omitted.');
  console.error(JSON.stringify({ type: error.name, code: error.code, fields: Object.keys(error.keyPattern || {}) }));
  process.exitCode = 1;
}).finally(() => mongoose.disconnect());
