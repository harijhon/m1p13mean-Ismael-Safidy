import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Récupérer tous les utilisateurs
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclure le mot de passe
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Créer un utilisateur (Admin)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const newUser = new User({
      name,
      email,
      password, // Sera hashé par le hook pre-save du modèle User
      role: role || 'user'
    });

    await newUser.save();
    
    // Retourner l'utilisateur sans le mot de passe
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({ message: 'Utilisateur créé avec succès', user: userResponse });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création', error: error.message });
  }
};

// Mettre à jour un utilisateur
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Mise à jour des champs
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();

    // Retourner l'utilisateur sans le mot de passe
    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json({ message: 'Utilisateur mis à jour', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour', error: error.message });
  }
};

// Supprimer un utilisateur
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression', error: error.message });
  }
};
