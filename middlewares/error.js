module.exports.error = (err, req, res, next) => {
  let { statusCode = 500, message } = err;
  if (err.name === 'CastError') {
    message = 'Передан не валидный идентификатор';
    statusCode = 400;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Такой email уже существует';
  }
  res.status(statusCode).send({
    message: statusCode === 500 ? 'Произошла ошибка' : message,
  });
  next();
};
