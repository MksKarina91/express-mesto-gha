const User = require('../models/user');

const {
  OK, CREATED, ERROR_CODE, NOT_FOUND, SERVER_ERROR,
} = require('../app');

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
    if (err.name === 'CastError') {
      return res.status(ERROR_CODE).json({ message: 'Некорректный формат идентификатора пользователя' });
    }
    return res.status(SERVER_ERROR).json({ message: 'На сервере произошла ошибка' });
  }
};

module.exports.createUser = async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.validate();

    await newUser.save();
    return res.status(CREATED).json(newUser);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(ERROR_CODE).json({ message: 'Ошибка валидации данных пользователя' });
    }
    return res.status(SERVER_ERROR).json({ message: 'На сервере произошла ошибка' });
  }
};

module.exports.updateProfile = async (req, res) => {
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
