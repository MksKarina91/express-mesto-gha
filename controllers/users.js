const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');
const NotFoundError = require('../errors/NotFoundError');
const UnauthorizedError = require('../errors/UnauthorizedError');

const OK = 200;
const CREATED = 201;

module.exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    return res.status(OK).send(users);
  } catch (error) {
    return next(error);
  }
};

module.exports.getUserById = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Пользователь по id не найден');
    }
    return res.status(OK).send(user);
  } catch (error) {
    return next(error);
  }
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }).then((user) => {
      res.status(CREATED).send({
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        _id: user._id,
      });
    }))
    .catch((err) => {
      console.error(err);
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Данные введены неверное, невозможно создать пользователя'));
      } else if (err.code === 11000) {
        next(new ConflictError('Пользователь уже зарегестрирован'));
      } else {
        next(err);
      }
    });
};

module.exports.updateUser = async (req, res, next) => {
  const { name, about } = req.body;
  const owner = req.user._id;
  try {
    const user = await User.findByIdAndUpdate(
      owner,
      { name, about },
      { new: true, runValidators: true },
    )
      .orFail(() => new NotFoundError('Пользователь по id не найден'));
    return res.send(user);
  } catch (error) {
    return next(error);
  }
};

module.exports.updateAvatar = async (req, res, next) => {
  const { avatar } = req.body;
  const owner = req.user._id;
  try {
    const user = await User.findByIdAndUpdate(
      owner,
      { avatar },
      { new: true, runValidators: true },
    )
      .orFail(() => new NotFoundError('Пользователь по id не найден'));
    return res.send(user);
  } catch (error) {
    return next(error);
  }
};

module.exports.getCurrentUser = async (req, res, next) => {
  const { _id } = req.user;
  try {
    const user = await User.findById(_id);
    return res.status(OK).send(user);
  } catch (error) {
    return next(error);
  }
};

module.exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password')
      .orFail(() => new UnauthorizedError('Неправильные почта или пароль'));
    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      throw new UnauthorizedError('Неправильные почта или пароль');
    }
    const token = jwt.sign(
      { _id: user._id },
      'same-secret-key',
      { expiresIn: '7d' },
    );
    return res
      .status(OK)
      .cookie('jwt', token, { maxAge: 3600000 * 24 * 7, httpOnly: true })
      .send({ data: { _id: user._id, email: user.email }, token });
  } catch (error) {
    return next(error);
  }
};
