const router = require('express').Router();
const {
  getCards,
  createCard,
  deleteCardById,
  likeCard,
  unlikeCard,
} = require('../controllers/cards');

const {
  validationCreateCard,
  validationCardById,
} = require('../validate/validate');

router.get('/cards', getCards);
router.post('/cards', validationCreateCard, createCard);
router.delete('/cards/:cardId', validationCardById, deleteCardById);
router.put('/cards/:cardId/likes', validationCardById, likeCard);
router.delete('/cards/:cardId/likes', validationCardById, unlikeCard);

module.exports = router;
