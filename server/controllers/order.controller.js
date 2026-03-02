import Order from '../models/Order.js';
import Product from '../models/Product.js';
import MouvementStock from '../models/MouvementStock.js';

export const createOrder = async (req, res) => {
    try {
        const storeId = req.storeContext;
        if (!storeId) {
            return res.status(400).json({ message: 'Store context required for this order.' });
        }

        const orderData = { ...req.body, store: storeId };
        const order = new Order(orderData);
        await order.save();

        if (order.status === 'COMPLETED') {
            const updateOperations = order.items.map(async (item) => {
                const product = await Product.findById(item.product);

                if (product && product.type === 'PRODUCT') {
                    if (product.hasVariants) {
                        if (!item.variantId && !item.variantSku) {
                            throw new Error('Variant information is required for products with variants');
                        }

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

                        if (variant.stock < item.quantity) {
                            throw new Error(`Insufficient stock for variant ${variant.sku}. Available: ${variant.stock}, Requested: ${item.quantity}`);
                        }

                        variant.stock -= item.quantity;
                    } else {
                        if (product.currentStock < item.quantity) {
                            throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.currentStock}, Requested: ${item.quantity}`);
                        }

                        product.currentStock -= item.quantity;
                    }

                    let applySalePrice = false;

                    if (product.sale && product.sale.isActive && product.sale.promoId) {
                        try {
                            const PromotionObj = (await import('../models/Promotion.js')).default;
                            const activePromo = await PromotionObj.findById(product.sale.promoId);

                            if (activePromo && activePromo.isActive) {
                                const now = new Date();
                                const isValidDate = now >= activePromo.startDate && now <= activePromo.endDate;
                                const isUnderLimit = (activePromo.usageLimit === null) || (activePromo.usageCount + item.quantity <= activePromo.usageLimit);

                                if (isValidDate && isUnderLimit) {
                                    applySalePrice = true;
                                    activePromo.usageCount += item.quantity;
                                    await activePromo.save();
                                } else if (!isValidDate || !isUnderLimit) {
                                    if (activePromo.usageLimit !== null && (activePromo.usageCount >= activePromo.usageLimit)) {
                                        activePromo.isActive = false;
                                        await activePromo.save();

                                        product.sale.isActive = false;
                                    }
                                }
                            }
                        } catch (err) {
                            console.error('Error processing promotion during order:', err);
                        }
                    }

                    await product.save();

                    const lastMouvement = await MouvementStock.findOne({ product_id: item.product }).sort({ date: -1 });
                    const previousReste = lastMouvement ? lastMouvement.reste : (product.currentStock + item.quantity);
                    const newReste = previousReste - item.quantity;

                    const prixUnitaire = applySalePrice && product.sale.salePrice
                        ? product.sale.salePrice
                        : (product.hasVariants && variant ? variant.price : product.price);

                    const mouvementLog = new MouvementStock({
                        product_id: item.product,
                        type: 'sortie',
                        quantite: item.quantity,
                        pu: prixUnitaire || 0,
                        date: new Date(),
                        reste: newReste
                    });

                    await mouvementLog.save();
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