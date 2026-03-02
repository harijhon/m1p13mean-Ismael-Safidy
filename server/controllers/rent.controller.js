import RentInvoice from '../models/RentInvoice.js';
import Store from '../models/Store.js';

// @desc    Generate monthly invoices for all ACTIVE stores
// @route   POST /api/rent/generate
// @access  Admin
export const generateInvoices = async (req, res) => {
    try {
        const { month, year } = req.body;
        if (!month || !year) {
            return res.status(400).json({ message: 'Month (1-12) and Year (YYYY) are required.' });
        }

        // Create a UTC date for the 1st of the specified month
        const invoiceMonth = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));

        // Fetch all validated stores (equivalent to active)
        const activeStores = await Store.find({ status: 'VALIDATED' });

        // Filter stores that have a valid rentContract and monthlyAmount > 0
        const invoicesToCreate = activeStores
            .filter(store => store.rentContract && store.rentContract.monthlyAmount > 0)
            .map(store => ({
                store: store._id,
                month: invoiceMonth,
                amountDue: store.rentContract.monthlyAmount,
                amountPaid: 0,
                status: 'PENDING',
                history: []
            }));

        let createdCount = 0;
        let skippedCount = 0;

        try {
            if (invoicesToCreate.length > 0) {
                // By using ordered: false, if an invoice already exists (11000 duplicate key error on our store+period index), 
                // MongoDB will skip it but continue inserting the rest.
                const result = await RentInvoice.insertMany(invoicesToCreate, { ordered: false });
                createdCount = result.length;
            }
        } catch (error) {
            if (error.code === 11000) {
                // Some or all invoices already exist (duplicate key), which is fine. It guarantees idempotency.
                createdCount = error.insertedDocs ? error.insertedDocs.length : 0;
                skippedCount = invoicesToCreate.length - createdCount;
            } else {
                throw error; // Rethrow other unexpected errors
            }
        }

        res.status(200).json({
            message: 'Invoices generation process completed',
            created: createdCount,
            skipped_duplicates: skippedCount
        });

    } catch (error) {
        console.error('Error generating rent invoices:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// @desc    Record a payment against a rent invoice
// @route   POST /api/rent/payment
// @access  Admin
export const recordPayment = async (req, res) => {
    try {
        const { invoiceId, amount, note } = req.body;

        if (!invoiceId || amount === undefined) {
            return res.status(400).json({ message: 'Invoice ID and Amount are required' });
        }

        const invoice = await RentInvoice.findById(invoiceId);
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Add payment to totals
        invoice.amountPaid += Number(amount);

        // Push to history array
        invoice.history.push({
            date: new Date(),
            amount: Number(amount),
            note: note || 'Payment received'
        });

        // Update status logic
        if (invoice.amountPaid >= invoice.amountDue) {
            invoice.status = 'PAID';
        } else {
            invoice.status = 'PARTIAL';
        }

        const updatedInvoice = await invoice.save();
        res.status(200).json({ message: 'Payment recorded successfully', invoice: updatedInvoice });
    } catch (error) {
        console.error('Error recording invoice payment:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// @desc    Get all rent invoices
// @route   GET /api/rent
// @access  Admin
export const getInvoices = async (req, res) => {
    try {
        const { month, year, status } = req.query;
        let filter = {};

        if (month && year) {
            const invoiceMonth = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));
            filter.month = invoiceMonth;
        }
        if (status) filter.status = status;

        const invoices = await RentInvoice.find(filter)
            .populate('store', 'name owner status rentContract')
            .sort({ createdAt: -1 });

        res.status(200).json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// @desc    Get macro rent statistics
// @route   GET /api/rent/stats
// @access  Admin
export const getRentStats = async (req, res) => {
    try {
        const invoices = await RentInvoice.find();

        let totalExpected = 0;
        let totalCollected = 0;
        let lateCount = 0;

        invoices.forEach(inv => {
            totalExpected += (inv.amountDue || 0);
            totalCollected += (inv.amountPaid || 0);
            if (inv.status === 'LATE') lateCount++;
        });

        res.status(200).json({
            totalExpected,
            totalCollected,
            lateCount
        });
    } catch (error) {
        console.error('Error fetching rent stats:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
