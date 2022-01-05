const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const authorization = require("../middlewares/authorization.middleware");

router.post("/signin", authController.signin);
router.post("/login", authController.login);
router.delete("/logout", authorization, authController.logout);
router.post("/refresh-token", authController.refreshToken);

module.exports = router;
