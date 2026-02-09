export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Forbidden: No role found' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden: Access requires one of these roles: ${allowedRoles.join(', ')}` });
    }

    next();
  };
};
