import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Convertir __dirname pour les ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger le fichier .env qui se trouve dans server/
dotenv.config({ path: path.join(__dirname, '../.env') });

// Importation du modèle Store
import Store from '../models/Store.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mean_app';

const migrateStores = async () => {
    try {
        console.log(`🔌 Connexion à MongoDB...`);
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connecté avec succès.\n');

        console.log('🚀 Démarrage de la migration des anciens magasins...');

        // Condition : On cible TOUS les magasins existants pour s'assurer qu'ils sont bien configurés
        const query = {};

        // On injecte le status ACTIVE et le contrat par défaut de 500€
        const update = {
            $set: {
                status: 'ACTIVE',
                rentContract: {
                    boxNumber: 'BOX-DEFAULT',
                    monthlyAmount: 500,
                    paymentDueDate: 5
                }
            }
        };

        // Exécution de la mise à jour en masse
        const result = await Store.updateMany(query, update);

        console.log('\n🎉 Migration Terminée !');
        console.log(`📊 Magasins correspondants trouvés : ${result.matchedCount}`);
        console.log(`✅ Magasins mis à jour avec succès : ${result.modifiedCount}\n`);

    } catch (error) {
        console.error('❌ La migration a échoué avec l\'erreur suivante :', error);
    } finally {
        console.log('🔌 Déconnexion de la base de données...');
        await mongoose.connection.close();
        console.log('🛑 Processus terminé.');
        process.exit(0);
    }
};

// Lancer la fonction
migrateStores();
