import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

export const getStats = async (req, res) => {
    try {
        const { storeId } = req.query;
        const matchStage = storeId ? { store: new mongoose.Types.ObjectId(storeId) } : {};
        const queryFilter = storeId ? { store: storeId } : {};

        // Calcul des statistiques
        const revenuePromise = Order.aggregate([
            {
                $match: {
                    status: 'COMPLETED',
                    ...matchStage
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' }
                }
            }
        ]);

        const ordersCountPromise = Order.countDocuments(queryFilter);

        const productsCountPromise = Product.countDocuments({ isActive: true, ...queryFilter });

        // For specific store: count unique customers who ordered. detailed filtering might be needed.
        // For global: User.countDocuments({ role: 'user' })
        let customersCountPromise;
        if (storeId) {
            customersCountPromise = Order.distinct('customer', queryFilter).then(ids => ids.length);
        } else {
            customersCountPromise = User.countDocuments({ role: 'user' });
        }

        const recentSalesPromise = Order.find({ status: 'COMPLETED', ...queryFilter })
            .populate('items.product')
            .populate('customer')
            .sort({ createdAt: -1 })
            .limit(5);

        const topProductsPromise = Order.aggregate([
            {
                $match: {
                    status: 'COMPLETED',
                    ...matchStage
                }
            },
            {
                $unwind: '$items'
            },
            {
                $group: {
                    _id: '$items.product',
                    totalQuantity: { $sum: '$items.quantity' }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $sort: { totalQuantity: -1 }
            },
            {
                $limit: 5
            }
        ]);

        const [
            revenueResult,
            ordersCount,
            productsCount,
            customersCount,
            recentSales,
            topProducts
        ] = await Promise.all([
            revenuePromise,
            ordersCountPromise,
            productsCountPromise,
            customersCountPromise,
            recentSalesPromise,
            topProductsPromise
        ]);

        const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        res.status(200).json({
            revenue,
            orders: ordersCount,
            products: productsCount,
            customers: customersCount,
            recentSales,
            topProducts
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};