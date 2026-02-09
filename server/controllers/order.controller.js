import Order from '../models/Order.js';
import Product from '../models/Product.js';
import InventoryLog from '../models/InventoryLog.js';

export const createOrder = async (req, res) => {
    try {
        const orderData = req.body;
        const order = new Order(orderData);
        await order.save();

        // Si la commande est complétée, mettre à jour le stock
        if (order.status === 'COMPLETED') {
            const updateOperations = order.items.map(async (item) => {
                const product = await Product.findById(item.product);
                
                // Ne traiter que les produits physiques, pas les services
                if (product && product.type === 'PRODUCT') {
                    // Décrémenter le stock
                    product.currentStock -= item.quantity;
                    await product.save();

                    // Créer un log d'inventaire
                    const inventoryLog = new InventoryLog({
                        product: item.product,
                        type: 'OUT',
                        quantity: item.quantity,
                        reason: `Sale #${order._id}`
                    });
                    await inventoryLog.save();
                }
            });

            await Promise.all(updateOperations);
        }

        res.status(201).json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};