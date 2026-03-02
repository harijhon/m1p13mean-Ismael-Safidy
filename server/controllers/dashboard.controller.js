import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

export const getStats = async (req, res) => {
    try {
        const storeId = req.storeContext;
        const baseOrderMatch = storeId ? { store: storeId } : {};
        const completedOrderMatch = storeId ? { status: 'COMPLETED', store: storeId } : { status: 'COMPLETED' };
        const productMatch = storeId ? { isActive: true, store: storeId } : { isActive: true };

        const revenuePromise = Order.aggregate([
            {
                $match: completedOrderMatch
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' }
                }
            }
        ]);

        const ordersCountPromise = Order.countDocuments(baseOrderMatch);

        const productsCountPromise = Product.countDocuments(productMatch);

        const customersCountPromise = User.countDocuments({ role: 'user' });

        const recentSalesPromise = Order.find(completedOrderMatch)
            .populate('items.product')
            .populate('customer')
            .sort({ createdAt: -1 })
            .limit(5);

        const topProductsPromise = Order.aggregate([
            {
                $match: completedOrderMatch
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
            topProducts,
            allCompletedOrders
        ] = await Promise.all([
            revenuePromise,
            ordersCountPromise,
            productsCountPromise,
            customersCountPromise,
            recentSalesPromise,
            topProductsPromise,
            Order.find(completedOrderMatch).populate('items.product').populate('customer').sort({ createdAt: -1 })
        ]);

        const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        const currentYear = new Date().getFullYear();
        const quarterlyRevenue = [0, 0, 0, 0];

        allCompletedOrders.forEach(order => {
            const date = new Date(order.createdAt);
            if (date.getFullYear() === currentYear) {
                const month = date.getMonth();
                const quarter = Math.floor(month / 3);
                quarterlyRevenue[quarter] += order.totalAmount;
            }
        });

        const notifications = allCompletedOrders.slice(0, 10).map(order => {
            const firstItemName = order.items && order.items.length > 0 && order.items[0].product
                ? order.items[0].product.name
                : 'un produit';
            return {
                type: 'SALE',
                customerName: order.customer ? order.customer.name : 'Un client',
                productName: firstItemName,
                amount: order.totalAmount,
                date: order.createdAt
            };
        });

        res.status(200).json({
            revenue,
            orders: ordersCount,
            products: productsCount,
            customers: customersCount,
            recentSales,
            topProducts,
            chartData: quarterlyRevenue,
            notifications
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};