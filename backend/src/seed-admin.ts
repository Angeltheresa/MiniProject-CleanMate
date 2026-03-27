/**
 * Admin User Seeder
 * Run: npx tsx src/seed-admin.ts
 * Creates an admin account if one doesn't already exist.
 */

import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import mongoose from 'mongoose';
import User from './models/User';

const ADMIN_CREDENTIALS = {
  fullName: 'CleanMate Admin',
  email: 'admin@cleanmate.com',
  username: 'admin',
  password: 'Admin@1234',   // ← Change this after first login!
  role: 'admin' as const,
  phone: '0000000000',
  address: 'CleanMate HQ',
};

async function seedAdmin() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not defined in .env');

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    const existing = await User.findOne({
      $or: [
        { username: ADMIN_CREDENTIALS.username },
        { email: ADMIN_CREDENTIALS.email },
      ],
    });

    if (existing) {
      console.log(`ℹ️  Admin user already exists:`);
      console.log(`   Username : ${existing.username}`);
      console.log(`   Email    : ${existing.email}`);
      console.log(`   Role     : ${existing.role}`);
    } else {
      const admin = await User.create(ADMIN_CREDENTIALS);
      console.log('🎉 Admin user created successfully!');
      console.log(`   Username : ${admin.username}`);
      console.log(`   Email    : ${admin.email}`);
      console.log(`   Password : ${ADMIN_CREDENTIALS.password}  ← CHANGE THIS!`);
      console.log(`   Role     : ${admin.role}`);
    }
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
