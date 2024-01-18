const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const Card = require('../models/card');
const { error } = require('../middlewares/error');

const OK = 200;
const CREATED = 201;

// eslint-disable-next-line consistent-return
module.exports.getCards = async (req, res, next) => {
  try {
    const cards = await Card.find();
    res.status(OK).send(cards);
  } catch (err) {
    return next(error);
  }
};

// eslint-disable-next-line consistent-return
module.exports.createCard = async (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  try {
    const newCard = await Card.create({
      name, link, owner,
    });
    return res.status(CREATED).send(newCard);
  } catch (err) {
    return next(error);
  }
};

module.exports.deleteCardById = async (req, res, next) => {
  const { cardId } = req.params;
  const owner = req.user._id;
  try {
    const selectedCard = await Card.findById({
      _id: cardId,
    })
      .orFail(() => new NotFoundError('Карточка не найдена'));
    if (owner !== selectedCard.owner.toString()) {
      throw new ForbiddenError('Карточку нельзя удалить');
    } else {
      await selectedCard.deleteOne();
      return res.status(OK).send(selectedCard);
    }
  } catch (err) {
    return next(error);
  }
};

module.exports.likeCard = async (req, res, next) => {
  const { cardId } = req.params;
  try {
    const card = await Card.findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    )
      .orFail(() => new NotFoundError('Карточка не найдена'));
    return res.send(card);
  } catch (err) {
    return next(error);
  }
};

module.exports.dislikeCard = async (req, res, next) => {
  const { cardId } = req.params;
  try {
    const card = await Card.findByIdAndUpdate(
      cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    )
      .orFail(() => new NotFoundError('Карточка не найдена'));
    return res.send(card);
  } catch (err) {
    return next(error);
  }
};
