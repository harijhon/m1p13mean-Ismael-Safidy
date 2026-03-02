import cron from 'node-cron';
import Store from '../models/Store.js';
import RentInvoice from '../models/RentInvoice.js';
import Notification from '../models/Notification.js';

// Logic to generate invoices
export const generateMonthlyRents = async () => {
    try {
        console.log(`[CRON] Starting Rent Generation for ${new Date().toISOString()}`);

        // Find all stores that are VALIDATED and have a box assigned
        const stores = await Store.find({
            status: 'VALIDATED',
            'rentContract.boxId': { $ne: null }
        });

        if (!stores || stores.length === 0) {
            console.log('[CRON] No validated stores found. Skipping rent generation.');
            return;
        }

        // Generate the first day of the current month (at 00:00:00)
        const now = new Date();
        const currentMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));

        let generatedCount = 0;

        for (const store of stores) {
            const monthlyAmount = store.rentContract.monthlyAmount;
            if (!monthlyAmount) continue;

            // Check for idempotency: Does an invoice already exist for this store and this exact month?
            const existingInvoice = await RentInvoice.findOne({
                store: store._id,
                month: currentMonthStart
            });

            if (!existingInvoice) {
                // Generate Invoice
                const invoice = new RentInvoice({
                    store: store._id,
                    month: currentMonthStart,
                    amountDue: monthlyAmount,
                    status: 'PENDING'
                });

                await invoice.save();
                generatedCount++;

                // Notify Manager
                await Notification.create({
                    user: store.owner,
                    type: 'GENERAL',
                    message: `Votre facture de loyer pour le mois de ${now.toLocaleString('fr-FR', { month: 'long' })} a été générée. Montant: ${monthlyAmount}€.`,
                    relatedStore: store._id
                });
            }
        }

        console.log(`[CRON] Successfully generated ${generatedCount} rent invoices.`);

    } catch (error) {
        console.error('[CRON] Error generating monthly rents:', error);
    }
};

// Start the Cron Job
// This runs at 00:00 on day-of-month 1.
export const startRentCronJob = () => {
    cron.schedule('0 0 1 * *', () => {
        generateMonthlyRents();
    });
    console.log('✅ Rent Generation Cron Job initiated (runs on the 1st of every month).');
};
