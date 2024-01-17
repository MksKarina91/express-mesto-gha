const router = require('express').Router();

const {
  getUsers,
  getUserById,
  updateUser,
  updateAvatar,
  getCurrentUser,
} = require('../controllers/users');

const {
  validationUpdateUser,
  validationUpdateAvatar,
  validationUserId,
} = require('../validate/validate');

router.get('/users', getUsers);
router.get('/users/:userId', validationUserId, getUserById);
router.post('/users/me', getCurrentUser);
router.patch('/users/me', validationUpdateUser, updateUser);
router.patch('/users/me/avatar', validationUpdateAvatar, updateAvatar);

module.exports = router;
