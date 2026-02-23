import Product from '../models/Product.js';

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const storeId = req.user?.storeId || req.body?.storeId; // storeId from JWT or body
        if (!storeId) {
            return res.status(403).json({ message: 'Forbidden: You must have a store to create a product.' });
        }

        const productData = {
            ...req.body,
            store: storeId // Automatically assign the store
        };

        const product = new Product(productData);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        // Mongoose validation errors are often 400 Bad Request
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Ownership check for managers
        if (req.user.role === 'manager' && product.store.toString() !== req.user.storeId) {
            return res.status(403).json({ message: 'Forbidden: You can only update products in your own store.' });
        }

        // Update fields and save
        Object.assign(product, req.body);
        const updatedProduct = await product.save();

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Ownership check for managers
        if (req.user.role === 'manager' && product.store.toString() !== req.user.storeId) {
            return res.status(403).json({ message: 'Forbidden: You can only delete products from your own store.' });
        }

        await product.deleteOne();
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};