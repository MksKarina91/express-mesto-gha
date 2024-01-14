const express = require('express');
const mongoose = require('mongoose');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Соединение с базой данных установлено');
}).catch((err) => {
  console.error('Ошибка подключения к базе данных:', err);
});
app.use(express.json());
app.use((req, res, next) => {
  req.user = {
    _id: '65a46118803b1ac3b9053d41',
  };

  next();
});

app.use('/', require('./routes/users'));
app.use('/', require('./routes/cards'));

app.use('/', (req, res) => {
  res.status(404).json({ message: 'Страница не найдена' });
});

module.exports.createCard = (req, res) => {
  console.log(req.user._id);

  res.status(200).send({ message: 'ответ получен' });
};

app.listen(PORT);
