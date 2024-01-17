const express = require('express');
const { errors } = require('celebrate');
const mongoose = require('mongoose');
const auth = require('./middlewares/auth');
const { login, createUser } = require('./controllers/users');
const { validationUserId } = require('./validate/validate');

const NOT_FOUND = 404;
const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Соединение с базой данных установлено'))
  .catch((err) => console.error('Ошибка подключения к базе данных:', err));

app.use(express.json());

app.post('/signin', validationUserId, login);
app.post('/signup', validationUserId, createUser);

app.use(auth);

app.use('/', require('./routes/users'));
app.use('/', require('./routes/cards'));

app.use((req, res) => {
  res.status(NOT_FOUND).json({ message: 'Страница не найдена' });
});

app.use(errors());

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
