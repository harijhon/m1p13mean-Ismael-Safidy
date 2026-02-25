import Store from '../models/Store.js';

export const requireStoreContext = async (req, res, next) => {
    try {
        const storeId = req.headers['x-store-id'];

        if (!storeId) {
            return res.status(400).json({ message: 'Store Context Required. Please select an active store in the dashboard.' });
        }

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ message: 'Invalid Store Context. Store not found.' });
        }

        if (req.user && req.user.role === 'manager') {
            const userId = req.user._id || req.user.id;
            if (store.owner.toString() !== userId.toString()) {
                return res.status(403).json({ message: 'Forbidden: You do not own the selected store context.' });
            }
        }

        req.storeContext = storeId;
        next();
    } catch (error) {
        console.error('Error verifying store context:', error);
        res.status(500).json({ message: 'Internal server error verifying store context' });
    }
};

export const optionalStoreContext = async (req, res, next) => {
    const storeId = req.headers['x-store-id'];
    if (storeId) {
        req.storeContext = storeId;
    }
    next();
};
