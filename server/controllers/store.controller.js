import Store from '../models/Store.js';
import User from '../models/User.js';

// @desc    Get all stores
// @route   GET /api/stores
// @access  Admin
export const getStores = async (req, res) => {
    try {
        const stores = await Store.find({}).populate('owner', 'name email');
        res.status(200).json(stores);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get a single store by ID
// @route   GET /api/stores/:id
// @access  Admin
export const getStoreById = async (req, res) => {
    try {
        const store = await Store.findById(req.params.id).populate('owner', 'name email');
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        res.status(200).json(store);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create a new store for the authenticated user
// @route   POST /api/stores
// @access  Admin, Manager
export const createStore = async (req, res) => {
    try {
        const { name, logo, description } = req.body;
        const ownerId = req.user._id;

        if (!name) {
            return res.status(400).json({ message: 'Name is required.' });
        }

        // Allow multiple stores per user

        const newStore = new Store({ name, owner: ownerId, logo, description });
        await newStore.save();
        res.status(201).json(newStore);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get the authenticated user's stores
// @route   GET /api/stores/my-stores
// @access  Admin, Manager
export const getMyStores = async (req, res) => {
    try {
        // Find all stores owned by the user
        const stores = await Store.find({ owner: req.user._id }).populate('owner', 'name email');

        res.status(200).json(stores);
    } catch (error) {
        console.error('Error fetching own stores:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update the authenticated user's store
// @route   PUT /api/stores/my-store
// @access  Admin, Manager
export const updateMyStore = async (req, res) => {
    try {
        const { storeId } = req.user;
        const { name, logo, description } = req.body;

        if (!storeId) {
            return res.status(403).json({ message: 'Forbidden: You do not own a store.' });
        }

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ message: 'Store not found.' });
        }

        // Ensure the user updating the store is the owner
        if (store.owner.toString() !== req.user._id) {
            return res.status(403).json({ message: 'Forbidden: You are not the owner of this store.' });
        }

        store.name = name || store.name;
        store.logo = logo !== undefined ? logo : store.logo; // Allow clearing logo
        store.description = description !== undefined ? description : store.description; // Allow clearing description

        const updatedStore = await store.save();
        res.status(200).json(updatedStore);

    } catch (error) {
        console.error('Error updating own store:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// @desc    Update a store
// @route   PUT /api/stores/:id
// @access  Admin
export const updateStore = async (req, res) => {
    try {
        const store = await Store.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        res.status(200).json(store);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a store
// @route   DELETE /api/stores/:id
// @access  Admin
export const deleteStore = async (req, res) => {
    try {
        const store = await Store.findById(req.params.id);
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        // TODO: Add logic here to handle products associated with the store before deleting.
        await store.deleteOne();
        res.status(200).json({ message: 'Store deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Send an eviction notice to a store
// @route   PUT /api/stores/:id/evict
// @access  Admin
export const sendEvictionNotice = async (req, res) => {
    try {
        const { reason } = req.body;
        const storeId = req.params.id || req.body.storeId;

        if (!storeId || !reason) {
            return res.status(400).json({ message: 'storeId and reason are required' });
        }

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        store.status = 'EVICTION_NOTICE';
        store.evictionReason = reason;

        const updatedStore = await store.save();
        res.status(200).json({ message: 'Eviction notice sent successfully', store: updatedStore });
    } catch (error) {
        console.error('Error sending eviction notice:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
