import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const migrateSlugs = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mean_app';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB.');

        const productsWithoutSlug = await Product.find({ slug: { $exists: false } });
        console.log(`Found ${productsWithoutSlug.length} products without a slug.`);

        for (const product of productsWithoutSlug) {
            // Because the pre hook now checks if this.slug is missing, 
            // just calling save() will trigger the slug generation.
            await product.save();
            console.log(`Updated product: ${product.name} -> ${product.slug}`);
        }

        console.log('Migration finished successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    }
};

migrateSlugs();
