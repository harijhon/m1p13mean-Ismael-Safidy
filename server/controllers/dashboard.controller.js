import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Store from '../models/Store.js';
import Box from '../models/Box.js';
import RentInvoice from '../models/RentInvoice.js';

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
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const getAdminStats = async (req, res) => {
    try {
        // --- 1. Boxes Stats ---
        const totalBoxesPromise = Box.countDocuments();
        const occupiedBoxesPromise = Box.countDocuments({ isOccupied: true });

        // --- 2. Stores Stats ---
        const totalValidatedStoresPromise = Store.countDocuments({ status: 'VALIDATED' });
        const pendingStoresPromise = Store.countDocuments({ status: 'PENDING' });

        // --- 3. Rent Stats ---
        const today = new Date();
        const startOfMonth = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1));
        const endOfMonth = new Date(Date.UTC(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59));

        const rentInvoicesPromise = RentInvoice.find({ month: { $gte: startOfMonth, $lte: endOfMonth } });
        const lateRentInvoicesPromise = RentInvoice.countDocuments({ status: 'LATE' });

        // --- 4. Recent Rents (last 5 payments/invoices) ---
        const recentRentsPromise = RentInvoice.find()
            .populate('store', 'name')
            .sort({ updatedAt: -1 }) // Sort by when it was last updated (e.g. paid or generated)
            .limit(5);

        // --- 5. Rent Revenue Chart Data (Current Year) ---
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(Date.UTC(currentYear, 0, 1));
        const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59));

        const yearlyPaidRentsPromise = RentInvoice.find({
            month: { $gte: startOfYear, $lte: endOfYear },
            status: { $in: ['PAID', 'PARTIAL'] }
        });

        const [
            totalBoxes,
            occupiedBoxes,
            totalValidatedStores,
            pendingStores,
            rentInvoicesThisMonth,
            lateRentInvoicesCount,
            recentRents,
            yearlyPaidRents
        ] = await Promise.all([
            totalBoxesPromise,
            occupiedBoxesPromise,
            totalValidatedStoresPromise,
            pendingStoresPromise,
            rentInvoicesPromise,
            lateRentInvoicesPromise,
            recentRentsPromise,
            yearlyPaidRentsPromise
        ]);

        const freeBoxes = totalBoxes - occupiedBoxes;

        // Calculate Rent Expected vs Collected for this month
        let rentExpectedThisMonth = 0;
        let rentCollectedThisMonth = 0;
        rentInvoicesThisMonth.forEach(inv => {
            rentExpectedThisMonth += (inv.amountDue || 0);
            rentCollectedThisMonth += (inv.amountPaid || 0);
        });

        // Calculate Quarterly Rent Revenue for the chart
        const quarterlyRentRevenue = [0, 0, 0, 0];
        yearlyPaidRents.forEach(inv => {
            const date = new Date(inv.month);
            if (date.getFullYear() === currentYear) {
                const month = date.getMonth();
                const quarter = Math.floor(month / 3);
                // In a real scenario, you'd track the exact payment date. 
                // For simplicity, we assign the paid amount to the quarter the invoice belongs to.
                quarterlyRentRevenue[quarter] += (inv.amountPaid || 0);
            }
        });

        res.status(200).json({
            boxes: {
                total: totalBoxes,
                occupied: occupiedBoxes,
                free: freeBoxes
            },
            stores: {
                validated: totalValidatedStores,
                pending: pendingStores
            },
            rent: {
                expectedThisMonth: rentExpectedThisMonth,
                collectedThisMonth: rentCollectedThisMonth,
                lateInvoices: lateRentInvoicesCount
            },
            recentRents,
            rentChartData: quarterlyRentRevenue
        });

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};