var router = require('express').Router();
const authenticateToken = require("../middlewares/token.middleware");

router.use('/auth', require('./auth'));
router.use('/protected', authenticateToken, require('./protected'));

module.exports = router;