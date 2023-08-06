import mongoose from 'mongoose';

let isConnected: boolean = false;

export const connectToDb = async () => {
  mongoose.set('strictQuery', false);

  if (!process.env.MONGODB_URL) return console.log('MONGODB_URL not found');
  if (isConnected) return console.log('Already connected to DB');

  try {
    await mongoose.connect(process.env.MONGODB_URL);
    isConnected = true;
    console.log('Connected to DB');
  } catch (error) {
    console.log('Error connecting to DB', error);
  }
};
