module.exports = (req, res, next) => {
  if (req.session && req.session.usuario) {
    return next();
  }
  return res.status(401).json({ error: 'No autorizado. Por favor inicia sesión.' });
};