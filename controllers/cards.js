const mongoose = require('mongoose');
const Card = require('../models/card');

const OK = 200;
const CREATED = 201;
const ERROR_CODE = 400;
const NOT_FOUND = 404;
const SERVER_ERROR = 500;

module.exports.getCards = async (req, res) => {
  try {
    const cards = await Card.find();
    res.status(OK).json(cards);
  } catch (err) {
    res.status(SERVER_ERROR).json({ message: 'На сервере произошла ошибка' });
  }
};

// eslint-disable-next-line consistent-return
module.exports.createCard = async (req, res) => {
  try {
    const newCard = new Card({
      name: req.body.name,
      link: req.body.link,
      owner: req.user._id,
    });
    await newCard.validate();
    await newCard.save();
    res.status(CREATED).json(newCard);
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(ERROR_CODE).json({ message: 'Ошибка валидации данных карточки' });
    }
    return res.status(SERVER_ERROR).json({ message: 'На сервере произошла ошибка' });
  }
};

module.exports.deleteCardById = async (req, res) => {
  const { cardId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return res.status(ERROR_CODE).json({ message: 'Некорректный ID карточки' });
  }

  try {
    const deletedCard = await Card.findByIdAndDelete(cardId);
    if (!deletedCard) {
      return res.status(NOT_FOUND).json({ message: 'Запрашиваемая карточка не найдена' });
    }
    return res.status(OK).json({ message: 'Карточка успешно удалена' });
  } catch (err) {
    return res.status(SERVER_ERROR).json({ message: 'На сервере произошла ошибка' });
  }
};

module.exports.likeCard = async (req, res) => {
  const { cardId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return res.status(ERROR_CODE).json({ message: 'Некорректный ID карточки' });
  }

  try {
    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );

    if (!updatedCard) {
      return res.status(NOT_FOUND).json({ message: 'Карточка не найдена' });
    }

    return res.status(OK).json(updatedCard);
  } catch (err) {
    return res.status(SERVER_ERROR).json({ message: 'На сервере произошла ошибка' });
  }
};

module.exports.unlikeCard = async (req, res) => {
  const { cardId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return res.status(ERROR_CODE).json({ message: 'Некорректный ID карточки' });
  }

  try {
    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );

    if (!updatedCard) {
      return res.status(NOT_FOUND).json({ message: 'Карточка не найдена' });
    }

    return res.status(OK).json(updatedCard);
  } catch (err) {
    return res.status(SERVER_ERROR).json({ message: 'На сервере произошла ошибка' });
  }
};
