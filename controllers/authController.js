const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const JWT_SECRET = 'super-secret-key';

router.post('/register', async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!email || !phone || !password) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, phone, password: hash });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, phone: user.phone },
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Ошибка валидации', details: err.errors.map(e => e.message) });
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Email или телефон уже заняты' });
    }
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(401).json({ error: 'Неверный email или пароль' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Неверный email или пароль' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, phone: user.phone } });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json({ user });
});

module.exports = router;