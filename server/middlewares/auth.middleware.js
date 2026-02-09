import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  // Allow OPTIONS requests (CORS Preflight) to pass without token
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers['authorization'];
  console.log('Auth Middleware - Headers:', req.headers); 
  
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.log('Auth Middleware - Token MISSING');
    return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('Auth Middleware - Token Verified:', decoded);
    next();
  } catch (error) {
    console.log('Auth Middleware - Token Invalid:', error.message);
    res.status(403).json({ message: 'Token invalide ou expiré.' });
  }
};
