import MouvementStock from '../models/MouvementStock.js';
import Product from '../models/Product.js';

export const getMouvementsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const mouvements = await MouvementStock.find({ product_id: productId })
            .sort({ date: -1 })
            .populate('product_id', 'name');

        res.status(200).json(mouvements);
    } catch (error) {
        console.error('Error fetching stock movements:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des mouvements de stock', error: error.message });
    }
};

export const createMouvement = async (req, res) => {
    try {
        const { product_id, type, quantite, pu } = req.body;

        if (!['entree', 'sortie'].includes(type)) {
            return res.status(400).json({ message: 'Le type doit être "entree" ou "sortie"' });
        }

        const product = await Product.findById(product_id);
        if (!product) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }

        const quantiteNum = Number(quantite);
        if (isNaN(quantiteNum) || quantiteNum <= 0) {
            return res.status(400).json({ message: 'La quantité doit être un nombre positif supérieur à 0' });
        }

        const lastMouvement = await MouvementStock.findOne({ product_id }).sort({ date: -1 });
        let currentReste = lastMouvement ? lastMouvement.reste : product.currentStock;

        if (type === 'sortie' && currentReste < quantiteNum) {
            return res.status(400).json({
                message: `Stock insuffisant. Reste actuel: ${currentReste}, Quantité demandée: ${quantiteNum}`
            });
        }

        const newReste = type === 'entree' ? currentReste + quantiteNum : currentReste - quantiteNum;

        product.currentStock = newReste;
        await product.save();

        const nouveauMouvement = new MouvementStock({
            product_id,
            type,
            quantite: quantiteNum,
            pu,
            date: new Date(),
            reste: newReste
        });

        await nouveauMouvement.save();

        res.status(201).json(nouveauMouvement);
    } catch (error) {
        console.error('Error creating stock movement:', error);
        res.status(500).json({ message: 'Erreur lors de la création du mouvement de stock', error: error.message });
    }
};
