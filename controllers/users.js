const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');

const OK = 200;
const ERROR_CODE = 400;
const NOT_FOUND = 404;
const SERVER_ERROR = 500;

module.exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(OK).json(users);
  } catch (err) {
    res.status(SERVER_ERROR).json({ message: 'На сервере произошла ошибка' });
  }
};

module.exports.getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(NOT_FOUND).json({ message: 'Запрашиваемый пользователь не найден' });
    }
    return res.status(OK).json(user);
  } catch (err) {
    console.error(err);
    if (err.name === 'CastError') {
      return res.status(ERROR_CODE).json({ message: 'Некорректный формат идентификатора пользователя' });
    }
    return res.status(SERVER_ERROR).json({ message: 'На сервере произошла ошибка' });
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
      res.status(201).send({
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

module.exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(NOT_FOUND).json({ message: 'Запрашиваемый пользователь не найден' });
    }

    user.name = req.body.name;
    user.about = req.body.about;

    await user.validate();
    await user.save();
    return res.status(OK).json(user);
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(ERROR_CODE).json({ message: 'Ошибка валидации данных пользователя' });
    }
    return res.status(SERVER_ERROR).json({ message: 'На сервере произошла ошибка' });
  }
};

module.exports.updateAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(NOT_FOUND).json({ message: 'Запрашиваемый пользователь не найден' });
    }
    user.avatar = req.body.avatar;
    await user.validate();
    await user.save();
    return res.status(OK).json(user);
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(ERROR_CODE).json({ message: 'Ошибка валидации данных пользователя' });
    }
    return res.status(SERVER_ERROR).json({ message: 'На сервере произошла ошибка' });
  }
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      res
        .cookie('jwt', token, {
          expires: new Date(Date.now() + 7 * 24 * 3600000),
          httpOnly: true,
          sameSite: true,
        })
        .status(OK)
        .send({ message: 'Вы авторизованы' });
    })
    .catch(next);
};
