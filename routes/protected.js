const { async } = require("validate.js");

var router = require("express").Router();

router.get("/hello", async (req, res) => {
	res.json({ ok: true, message: "Hello I'm a protected route" });
});

module.exports = router;
