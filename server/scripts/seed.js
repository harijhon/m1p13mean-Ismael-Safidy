import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Store from '../models/Store.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// Load environment variables
dotenv.config();

const seedData = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mean_app';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB.');

        // --- 1. Clean all collections ---
        console.log('Cleaning database...');
        await Order.deleteMany({});
        await Product.deleteMany({});
        await Store.deleteMany({});
        await User.deleteMany({});
        console.log('All collections cleared.');

        // --- 2. Create a new Admin User ---
        const adminUser = new User({
            name: 'Admin Owner',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin' // This user is both an admin and a store owner
        });
        await adminUser.save();
        console.log(`Created user: ${adminUser.name}`);

        // --- 3. Create a Store for the User ---
        const store = new Store({
            name: 'Sakai Apparel',
            owner: adminUser._id,
            logo: 'https://www.primefaces.org/sakai-ng/assets/layout/images/logo-dark.svg'
        });
        await store.save();
        console.log(`Created store: ${store.name}`);

        // --- 4. Create Products for the Store ---
        const productsToCreate = [
            { name: 'Black T-Shirt', price: 25, currentStock: 100 },
            { name: 'Blue Jeans', price: 60, currentStock: 80 },
            { name: 'White Sneakers', price: 90, currentStock: 120 },
            { name: 'Leather Jacket', price: 250, currentStock: 30 },
            { name: 'Beanie Hat', price: 15, currentStock: 200 },
        ];

        const createdProducts = [];
        for (const p of productsToCreate) {
            const product = new Product({
                store: store._id,
                name: p.name,
                price: p.price,
                costPrice: p.price * 0.5, // 50% margin
                currentStock: p.currentStock,
                type: 'PRODUCT',
                isActive: true,
                hasVariants: false,
                images: ['https://primefaces.org/cdn/primeng/images/demo/product/product-placeholder.svg']
            });
            const newProduct = await product.save();
            createdProducts.push(newProduct);
        }
        console.log(`${createdProducts.length} products created.`);
        
        console.log('Seeding finished successfully!');

    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
};

seedData();