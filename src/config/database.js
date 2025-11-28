import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL via Prisma');
  } catch (error) {
    console.error('❌ Error connecting to PostgreSQL:', error);
    process.exit(1);
  }
};

export default connectDB;
