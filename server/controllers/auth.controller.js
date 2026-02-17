import User from '../models/User.js';
import Store from '../models/Store.js'; // Import Store model
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  console.log("--> Register appelé !"); // Debug
  try {
    const { name, email, password } = req.body;
    
    // Vérif existant
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Création - Force role 'user' pour inscription publique
    const newUser = new User({ 
      name, 
      email, 
      password, 
      role: 'user' 
    });
    
    await newUser.save();

    console.log("--> User créé avec succès"); // Debug
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("--> ERREUR REGISTER:", error); // Debug
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

    // Prepare JWT payload
    const payload = { 
      _id: user._id, 
      email: user.email, 
      role: user.role, 
      name: user.name 
    };

    // Check if the user owns a store and add it to the payload
    const store = await Store.findOne({ owner: user._id });
    if (store) {
      payload.storeId = store._id;
    }

    // Expiration réglée à 12h
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });

    res.json({ token, user: payload });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createManager = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Le password sera hashé par le hook pre-save du modèle User
    const newManager = new User({
      name,
      email,
      password,
      role: 'manager'
    });

    await newManager.save();

    res.status(201).json({ message: 'Manager created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
