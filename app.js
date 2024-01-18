const express = require('express');
const { errors, celebrate, Joi } = require('celebrate');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { login, createUser } = require('./controllers/users');
const { auth } = require('./middlewares/auth');
const { error } = require('./middlewares/error');
const NotFoundError = require('./errors/NotFoundError');

const { PORT = 3000 } = process.env;
const REGEX = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;
const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb')
  .then(() => console.log('Соединение с базой данных установлено'))
  .catch((err) => console.error('Ошибка подключения к базе данных:', err));

app.use(express.json());
app.use(cookieParser());
console.log('login:', login, 'createUser:', createUser);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().regex(REGEX),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().regex(REGEX),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
}), createUser);

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
