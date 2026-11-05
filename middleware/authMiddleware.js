const jwt = require('jsonwebtoken');
const JWT_SECRET = 'super-secret-key';

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Неверная схема. Используйте Bearer <token>' });
  }

  const token = parts[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Невалидный или просроченный токен' });
  }
};