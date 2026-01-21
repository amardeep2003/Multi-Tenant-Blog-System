const express = require('express');
const router = express.Router();
const { register, login, getMe, getTenants } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.get('/tenants', getTenants);
router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);

module.exports = router;