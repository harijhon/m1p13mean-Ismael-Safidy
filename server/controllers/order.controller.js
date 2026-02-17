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
                    if (product.hasVariants) {
                        // Gestion des produits avec variantes
                        if (!item.variantId && !item.variantSku) {
                            throw new Error('Variant information is required for products with variants');
                        }

                        // Trouver la variante spécifique
                        let variantIndex = -1;
                        if (item.variantId) {
                            variantIndex = product.variants.findIndex(v => v._id.equals(item.variantId));
                        } else if (item.variantSku) {
                            variantIndex = product.variants.findIndex(v => v.sku === item.variantSku);
                        }

                        if (variantIndex === -1) {
                            throw new Error('Specified variant not found');
                        }

                        const variant = product.variants[variantIndex];

                        // Vérifier le stock de la variante
                        if (variant.stock < item.quantity) {
                            throw new Error(`Insufficient stock for variant ${variant.sku}. Available: ${variant.stock}, Requested: ${item.quantity}`);
                        }

                        // Décrémenter le stock de la variante
                        variant.stock -= item.quantity;
                    } else {
                        // Gestion des produits simples
                        if (product.currentStock < item.quantity) {
                            throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.currentStock}, Requested: ${item.quantity}`);
                        }

                        // Décrémenter le stock global
                        product.currentStock -= item.quantity;
                    }

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