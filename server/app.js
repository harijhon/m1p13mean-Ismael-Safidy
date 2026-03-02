import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js';
import promotionRoutes from './routes/promotion.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import orderRoutes from './routes/orders.js';
import storeRoutes from './routes/stores.js';
import rentRoutes from './routes/rent.routes.js';
import mouvementStockRoutes from './routes/mouvementStock.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/rent', rentRoutes);
app.use('/api/stock', mouvementStockRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mean_app';

if (!cached.promise) {
  cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false })
    .then((mongoose) => {
      console.log('Connected to MongoDB');
      if (process.env.VERCEL !== '1') {
        app.listen(PORT, () => {
          console.log(`Server is running on port ${PORT}`);
        });
      }
      return mongoose;
    })
    .catch((err) => {
      console.error('Database connection error:', err);
      cached.promise = null;
    });
}

export default app;