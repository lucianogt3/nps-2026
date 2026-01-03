const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Lista de rotas públicas
  const publicRoutes = ['/api/responses', '/api/login']; // Ajuste conforme necessário

  if (publicRoutes.includes(req.path)) {
    return next();
  }

  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = authMiddleware;