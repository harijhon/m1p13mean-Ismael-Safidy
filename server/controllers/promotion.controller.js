import Promotion from '../models/Promotion.js';
import Product from '../models/Product.js';

export const createPromotion = async (req, res) => {
    try {
        const promoData = req.body;
        // Expected payload: { store, product, discountPercent, startDate, endDate, usageLimit(optional) }

        // Start a session for atomicity (optional based on replica set, but good practice if available)
        // For simplicity without replica sets, we use sequential await
        const promo = new Promotion(promoData);
        await promo.save();

        // Find product and apply discount natively
        const product = await Product.findById(promo.product);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const salePrice = product.price - (product.price * (promo.discountPercent / 100));

        product.sale = {
            isActive: true,
            discountPercent: promo.discountPercent,
            salePrice: salePrice,
            promoId: promo._id
        };

        if (product.hasVariants && product.variants && product.variants.length > 0) {
            // Optionally calculate variant specific sale prices here if variants have distinct prices
            // The frontend should also calculate or reference this sale percentage
        }

        await product.save();

        res.status(201).json({ message: 'Promotion created and product updated', promo });
    } catch (error) {
        console.error('Error creating promotion:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const stopPromotion = async (req, res) => {
    try {
        const { id } = req.params;

        const promo = await Promotion.findById(id);
        if (!promo) {
            return res.status(404).json({ message: 'Promotion not found' });
        }

        promo.isActive = false;
        await promo.save();

        // Reset the Product's sale
        const product = await Product.findById(promo.product);
        if (product && product.sale && product.sale.promoId && product.sale.promoId.equals(promo._id)) {
            product.sale.isActive = false;
            await product.save();
        }

        res.status(200).json({ message: 'Promotion stopped successfully' });
    } catch (error) {
        console.error('Error stopping promotion:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const getPromotionsByStore = async (req, res) => {
    try {
        const { storeId } = req.params;
        const promotions = await Promotion.find({ store: storeId }).populate('product', 'name price');
        res.status(200).json(promotions);
    } catch (error) {
        console.error('Error fetching promotions:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
