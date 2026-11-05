const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
require('./models/User');
const authRoutes = require('./controllers/authController');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/api/', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
  });
});