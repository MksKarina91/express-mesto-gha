const express = require('express');
const { errors } = require('celebrate');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { login, createUser } = require('./controllers/users');
const { auth } = require('./middlewares/auth');
const { validationUserId } = require('./validate/validate');
const { error } = require('./middlewares/error');
const NotFoundError = require('./errors/NotFoundError');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb')
  .then(() => console.log('Соединение с базой данных установлено'))
  .catch((err) => console.error('Ошибка подключения к базе данных:', err));

app.use(express.json());
app.use(cookieParser());
console.log('login:', login, 'createUser:', createUser);

app.post('/signin', validationUserId, login);
app.post('/signup', validationUserId, createUser);

app.use(auth);

app.use('/', require('./routes/users'));
app.use('/', require('./routes/cards'));

app.use('/', (req, res, next) => {
  next(new NotFoundError('Страницы не существует'));
});

app.use(errors());
app.use('/', error);

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
