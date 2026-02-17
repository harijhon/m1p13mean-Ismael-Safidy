import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Store from '../models/Store.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import InventoryLog from '../models/InventoryLog.js';

// Charger les variables d'environnement
dotenv.config();

// Fonction principale
const resetDb = async () => {
    try {
        // Connexion à la base de données
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mean_app';
        await mongoose.connect(uri);
        console.log('Connecté à la base de données');

        // Suppression des collections (sauf User)
        const storeCount = await Store.countDocuments();
        await Store.deleteMany({});
        console.log(`✅ ${storeCount} Stores supprimés`);

        const productCount = await Product.countDocuments();
        await Product.deleteMany({});
        console.log(`✅ ${productCount} Produits supprimés`);

        const orderCount = await Order.countDocuments();
        await Order.deleteMany({});
        console.log(`✅ ${orderCount} Commandes supprimées`);

        const inventoryLogCount = await InventoryLog.countDocuments();
        await InventoryLog.deleteMany({});
        console.log(`✅ ${inventoryLogCount} Logs d'inventaire supprimés`);

        // Ne pas supprimer les utilisateurs pour conserver les comptes admin

        console.log('Reset de la base de données terminé avec succès !');
    } catch (error) {
        console.error('Erreur lors du reset de la base de données:', error);
    } finally {
        // Fermeture de la connexion
        await mongoose.connection.close();
        console.log('Connexion à la base de données fermée');
    }
};

// Exécution du script
resetDb();