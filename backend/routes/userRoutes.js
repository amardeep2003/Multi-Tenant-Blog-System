const express = require('express');
const router = express.Router();
const { getAllUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/userController');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleAuth');

router.use(auth);

router.route('/')
  .get(getAllUsers)
  .post(isAdmin, createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(isAdmin, deleteUser);

module.exports = router;