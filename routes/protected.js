var router = require("express").Router();

router.get("/hello", (req, res) => {
	res.json({ ok: true, message: "Hello I'm a protected route" });
});

module.exports = router;
