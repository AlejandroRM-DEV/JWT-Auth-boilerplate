var router = require("express").Router();
const authController = require("../controllers/auth.controller");
const authenticateToken = require("../middlewares/token.middleware");

router.post("/signin", authController.signin);
router.post("/login", authController.login);
router.delete("/logout", authenticateToken, authController.logout);
router.post("/refresh-token", authController.refreshToken);

module.exports = router;
