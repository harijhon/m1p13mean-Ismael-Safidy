import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Store from '../models/Store.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import InventoryLog from '../models/InventoryLog.js';

// Charger les variables d'environnement
dotenv.config();

// Fonction pour générer une date aléatoire dans les 7 derniers jours
const getRandomDateLastWeek = () => {
    const now = new Date();
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 jours plus tôt
    return new Date(start.getTime() + Math.random() * (now.getTime() - start.getTime()));
};

// Fonction pour générer un statut aléatoire
const getRandomStatus = () => {
    const statuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'PENDING']; // 80% COMPLETED, 20% PENDING
    return statuses[Math.floor(Math.random() * statuses.length)];
};

// Fonction pour générer un prix aléatoire entre min et max
const getRandomPrice = (min, max) => {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
};

// Fonction principale
const seedData = async () => {
    try {
        // Connexion à la base de données
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mean_app';
        await mongoose.connect(uri);
        console.log('Connecté à la base de données');

        // Nettoyage des collections existantes (sauf User)
        await Order.deleteMany({});
        await Product.deleteMany({});
        await Store.deleteMany({});
        await InventoryLog.deleteMany({});
        console.log('Collections nettoyées (sauf User)');

        // Récupération du premier utilisateur ou création d'un administrateur
        let user = await User.findOne();
        if (!user) {
            console.log('Aucun utilisateur trouvé. Création d\'un utilisateur administrateur...');
            // Création d'un utilisateur administrateur par défaut
            user = new User({
                name: 'Admin',
                email: 'admin@example.com',
                password: 'admin123', // En production, assurez-vous de hasher le mot de passe
                role: 'admin'
            });
            await user.save();
            console.log('Utilisateur administrateur créé: Admin');
        } else {
            console.log(`Utilisateur trouvé: ${user.name}`);
        }

        // Création du store
        const store = new Store({
            name: 'Fashion Demo',
            owner: user._id,
            settings: {
                currency: 'EUR',
                timezone: 'Europe/Paris'
            }
        });
        await store.save();
        console.log(`Store créé: ${store.name}`);

        // Création des produits
        const simpleProductNames = [
            'Casquette', 'Echarpe', 'Ceinture', 'Portefeuille', 'Montre'
        ];

        const variantProductNames = [
            'Jean Slim', 'T-Shirt Col V', 'Pull Oversize', 'Veste Cuir', 'Robe d\'été'
        ];

        const createdProducts = [];

        // Création des produits simples (5)
        for (let i = 0; i < 5; i++) {
            const productName = simpleProductNames[i];
            const price = getRandomPrice(20, 150);
            const costPrice = price * 0.6; // Prix de revient à 60% du prix de vente
            
            const product = new Product({
                store: store._id,
                name: productName,
                type: 'PRODUCT', // On crée des produits physiques
                price: price,
                costPrice: costPrice,
                currentStock: 100,
                hasVariants: false,
                images: [`https://primefaces.org/cdn/primeng/images/demo/product-placeholder.svg`],
                isActive: true
            });
            
            await product.save();
            createdProducts.push(product);
        }

        // Création des produits avec variantes (5)
        for (let i = 0; i < 5; i++) {
            const productName = variantProductNames[i];
            const price = getRandomPrice(20, 150);
            const costPrice = price * 0.6; // Prix de revient à 60% du prix de vente
            
            // Création des variantes pour chaque produit
            const variants = [];
            const colors = ['Rouge', 'Bleu', 'Noir', 'Blanc'];
            const sizes = ['S', 'M', 'L', 'XL'];

            // Générer quelques combinaisons de variantes
            for (let j = 0; j < 3; j++) {
                const color = colors[j % colors.length];
                const size = sizes[j % sizes.length];
                const sku = `${productName.replace(/\s+/g, '')}-${color}-${size}`;
                
                variants.push({
                    sku: sku,
                    attributes: {
                        'Couleur': color,
                        'Taille': size
                    },
                    price: price + (j * 5), // Prix légèrement différent par variante
                    stock: 50
                });
            }
            
            const product = new Product({
                store: store._id,
                name: productName,
                type: 'PRODUCT', // On crée des produits physiques
                price: price,
                costPrice: costPrice,
                currentStock: 0, // Pour les produits avec variantes, le stock est géré par variante
                hasVariants: true,
                variants: variants,
                images: [`https://primefaces.org/cdn/primeng/images/demo/product-placeholder.svg`],
                isActive: true
            });
            
            await product.save();
            createdProducts.push(product);
        }

        console.log(`${createdProducts.length} produits créés (${simpleProductNames.length} simples, ${variantProductNames.length} avec variantes)`);

        // Création des commandes
        for (let i = 0; i < 50; i++) {
            // Sélection aléatoire de 1 à 3 produits
            const numItems = Math.floor(Math.random() * 3) + 1; // Entre 1 et 3
            const selectedProducts = [];
            const uniqueIndices = new Set();
            
            while (selectedProducts.length < numItems) {
                const randomIndex = Math.floor(Math.random() * createdProducts.length);
                if (!uniqueIndices.has(randomIndex)) {
                    uniqueIndices.add(randomIndex);
                    const product = createdProducts[randomIndex];
                    
                    // Quantité aléatoire entre 1 et 5
                    const quantity = Math.floor(Math.random() * 5) + 1;
                    
                    selectedProducts.push({
                        product: product._id,
                        quantity: quantity,
                        priceAtMoment: product.price
                    });
                }
            }

            // Calcul du montant total
            const totalAmount = selectedProducts.reduce((sum, item) => sum + (item.priceAtMoment * item.quantity), 0);

            const order = new Order({
                store: store._id,
                customer: user._id, // Utilisation du même utilisateur pour toutes les commandes
                items: selectedProducts,
                totalAmount: totalAmount,
                status: getRandomStatus(),
                paymentMethod: ['Credit Card', 'PayPal', 'Bank Transfer'][Math.floor(Math.random() * 3)]
            });

            // Définir une date aléatoire dans les 7 derniers jours
            order.createdAt = getRandomDateLastWeek();
            order.updatedAt = order.createdAt;

            await order.save();
        }
        console.log('50 commandes créées');

        // Si une commande est COMPLETED, mettre à jour le stock et créer des logs d'inventaire
        const completedOrders = await Order.find({ status: 'COMPLETED' });
        for (const order of completedOrders) {
            for (const item of order.items) {
                const product = await Product.findById(item.product);
                if (product && product.type === 'PRODUCT') {
                    // Décrémenter le stock
                    product.currentStock -= item.quantity;
                    await product.save();

                    // Créer un log d'inventaire
                    const inventoryLog = new InventoryLog({
                        product: item.product,
                        type: 'OUT',
                        quantity: item.quantity,
                        reason: `Sale #${order._id}`
                    });
                    await inventoryLog.save();
                }
            }
        }
        console.log('Stocks mis à jour et logs d\'inventaire créés pour les commandes complétées');

        console.log('Seeding réussi !');
    } catch (error) {
        console.error('Erreur lors du seeding:', error);
    } finally {
        // Fermeture de la connexion
        await mongoose.connection.close();
        console.log('Connexion à la base de données fermée');
    }
};

// Exécution du script
seedData();