const router = require("express").Router();
const authorization = require("../middlewares/authorization.middleware");

router.use("/auth", require("./auth"));
router.use("/protected", authorization, require("./protected"));

module.exports = router;
