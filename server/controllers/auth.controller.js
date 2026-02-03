import User from '../models/User.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  console.log("--> Register appelé !"); // Debug
  try {
    const { name, email, password, role } = req.body;
    
    // Vérif existant
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Création
    const newUser = new User({ name, email, password, role });
    await newUser.save();

    console.log("--> User créé avec succès"); // Debug
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("--> ERREUR REGISTER:", error); // Debug
    // ICI : Pas de 'next', donc impossible d'avoir l'erreur "next is not a function"
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { id: user._id, email: user.email, role: user.role, name: user.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ token, user: payload });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};