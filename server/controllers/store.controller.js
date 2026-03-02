import Store from '../models/Store.js';
import User from '../models/User.js';
import Box from '../models/Box.js';
import Notification from '../models/Notification.js';

// @desc    Get all stores
// @route   GET /api/stores
// @access  Admin
export const getStores = async (req, res) => {
    try {
        const stores = await Store.find({})
            .populate('owner', 'name email')
            .populate('rentContract.requestedBoxId', 'boxNumber floor')
            .populate('rentContract.boxId', 'boxNumber floor');
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

        // requestedBoxId can be optionally passed by the manager
        const { requestedBoxId } = req.body;

        const newStore = new Store({
            name,
            owner: ownerId,
            logo,
            description,
            status: 'CREATED',
            statusHistory: [{ status: 'CREATED' }],
            rentContract: {
                requestedBoxId: requestedBoxId || null
            }
        });
        await newStore.save();

        // ----------------------------------------------------
        // NOTIFICATION: Alert all Admins about the new request
        // ----------------------------------------------------
        const admins = await User.find({ role: 'admin' }).select('_id');
        const notifications = admins.map(admin => ({
            user: admin._id,
            type: 'BOX_REQUEST',
            message: `Demande de création de magasin et Box reçu : ${name}`,
            relatedStore: newStore._id
        }));
        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

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
        const stores = await Store.find({ owner: req.user._id })
            .populate('owner', 'name email')
            .populate('rentContract.boxId', 'boxNumber floor');

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

        store.status = 'PRE_NOTICE';
        store.statusHistory.push({ status: 'PRE_NOTICE' });
        store.evictionReason = reason;

        // Example: Eviction date is set to 30 days from now
        const evictionDate = new Date();
        evictionDate.setDate(evictionDate.getDate() + 30);
        store.evictionDate = evictionDate;

        const updatedStore = await store.save();

        // ----------------------------------------------------
        // NOTIFICATION: Alert the Store Owner (Manager)
        // ----------------------------------------------------
        await Notification.create({
            user: store.owner,
            type: 'PRE_NOTICE_ALERT',
            message: `Votre magasin "${store.name}" a reçu un pré-avis pour la raison suivante : ${reason}. Vous avez jusqu'au ${evictionDate.toLocaleDateString()}.`,
            relatedStore: store._id
        });

        res.status(200).json({ message: 'Eviction notice sent successfully', store: updatedStore });
    } catch (error) {
        console.error('Error sending eviction notice:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Validate Store and Assign Box
// @route   PUT /api/stores/:id/validate
// @access  Admin
export const validateStoreAndAssignBox = async (req, res) => {
    try {
        const { boxId, monthlyAmount } = req.body;
        const storeId = req.params.id;

        if (!boxId || !monthlyAmount) {
            return res.status(400).json({ message: 'boxId and monthlyAmount are required for validation.' });
        }

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ message: 'Store not found.' });
        }

        if (store.status !== 'CREATED') {
            return res.status(400).json({ message: `Store cannot be validated because its status is ${store.status}.` });
        }

        const box = await Box.findById(boxId);
        if (!box) {
            return res.status(404).json({ message: 'Box not found.' });
        }

        if (box.isOccupied) {
            return res.status(400).json({ message: 'This box is already occupied by another store.' });
        }

        // Update Store
        store.status = 'VALIDATED';
        store.statusHistory.push({ status: 'VALIDATED' });
        store.rentContract.boxId = box._id;
        store.rentContract.monthlyAmount = monthlyAmount;
        await store.save();

        // Update Box
        box.isOccupied = true;
        box.currentStore = store._id;
        await box.save();

        // ----------------------------------------------------
        // NOTIFICATION: Alert the Store Owner upon validation
        // ----------------------------------------------------
        await Notification.create({
            user: store.owner,
            type: 'STORE_VALIDATED',
            message: `Bonne nouvelle ! Votre magasin "${store.name}" a été validé. Le Box numéro ${box.boxNumber} vous a été assigné.`,
            relatedStore: store._id
        });

        res.status(200).json({ message: 'Store successfully validated and Box assigned.', store });

    } catch (error) {
        console.error('Error validating store:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all available empty boxes
// @route   GET /api/stores/boxes/empty
// @access  Admin
export const getEmptyBoxes = async (req, res) => {
    try {
        const boxes = await Box.find({ isOccupied: false }).sort({ boxNumber: 1 });
        res.status(200).json(boxes);
    } catch (error) {
        console.error('Error fetching empty boxes:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
