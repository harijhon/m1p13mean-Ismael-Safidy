import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Box from './models/Box.js';

dotenv.config();

const TENTATIVE_DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopeasy';

const generateBoxes = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(TENTATIVE_DB_URI);
        console.log('Connected to MongoDB');

        console.log('Clearing existing Boxes...');
        await Box.deleteMany({});

        const boxesToInsert = [];

        // 5 floors, 20 boxes per floor
        for (let floor = 1; floor <= 5; floor++) {
            for (let num = 1; num <= 20; num++) {
                // Hotel numbering logic: Floor * 100 + num
                // Example: Floor 1, Num 1 -> 101. Floor 3, num 20 -> 320
                const boxNumber = (floor * 100) + num;

                boxesToInsert.push({
                    boxNumber: boxNumber,
                    floor: floor,
                    isOccupied: false,
                    currentStore: null
                });
            }
        }

        console.log(`Inserting ${boxesToInsert.length} boxes into the database...`);
        await Box.insertMany(boxesToInsert);

        console.log('🎉 Successfully created 100 boxes!');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding boxes:', error);
        process.exit(1);
    }
};

generateBoxes();
