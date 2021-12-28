var router = require("express").Router();
const jwt = require("jsonwebtoken");
const validate = require("validate.js");
const bcrypt = require("bcrypt");
const models = require("../models");
const authenticateToken = require("../middlewares/token.middleware");

const cookieOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
};

const generateTokens = (user) => {
	const accessTokenPayload = { user_id: user.user_id, iat: Date.now() };
	const refreshTokenPayload = { user_id: user.user_id, iat: Date.now() };
	const accessToken = jwt.sign(accessTokenPayload, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: process.env.ACCESS_TOKEN_EXP,
	});
	const refreshToken = jwt.sign(refreshTokenPayload, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: process.env.REFRESH_TOKEN_EXP,
	});
	return { accessToken, refreshToken };
};

router.post("/signin", async (req, res) => {
	const data = { email: req.body.email, password: req.body.password };

	const errors = validate(data, {
		email: { presence: { allowEmpty: false }, email: true },
		password: { presence: { allowEmpty: false } },
	});
	if (errors) return res.json({ ok: false, error: errors });

	const prevUser = await models.users.findOne({ attributes: ["user_id"], where: { email: data.email } });
	if (prevUser) return res.json({ ok: false, error: "The email already exists" });

	const newUser = await models.users.create({ ...data, password: bcrypt.hashSync(data.password, 10) });
	if (newUser) res.json({ ok: true });
	else res.json({ ok: false, error: "Uknown error" });
});

router.post("/login", async (req, res) => {
	const data = { email: req.body.email, password: req.body.password };

	const errors = validate(data, {
		email: { presence: { allowEmpty: false }, email: true },
		password: { presence: { allowEmpty: false } },
	});
	if (errors) return res.json({ ok: false, error: errors });

	const user = await models.users.findOne({ attributes: ["user_id", "password"], where: { email: data.email } });
	if (!user) {
		return res.json({ ok: false, error: "The email does not exists" });
	} else if (!bcrypt.compareSync(data.password, user.password)) {
		return res.json({ ok: false, error: "Incorrect credentials. Try again" });
	}

	const { accessToken, refreshToken } = generateTokens({ ...user.dataValues });
	const tokenStored = await models.refresh_tokens.create({ token: refreshToken, user_id: user.user_id });
	if (tokenStored)
		res.cookie("refresh_token", refreshToken, cookieOptions).json({ ok: true, accessToken: accessToken });
	else res.json({ ok: false, error: "Uknown error" });
});

router.delete("/logout", authenticateToken, async (req, res) => {
	const refreshToken = req.cookies?.refresh_token || "";
	await models.refresh_tokens.destroy({ where: { token: refreshToken } });
	res.clearCookie("refresh_token").json({ ok: true, message: "Successfully logged out" });
});

router.post("/refresh-token", async (req, res) => {
	const prevRefreshToken = req.cookies.refresh_token;
	if (!prevRefreshToken) return res.sendStatus(401);

	const token = await models.refresh_tokens.findOne({ attributes: ["user_id"], where: { token: prevRefreshToken } });
	if (!token) return res.sendStatus(403);

	jwt.verify(prevRefreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
		if (err) return res.sendStatus(403);

		await models.refresh_tokens.destroy({ where: { token: prevRefreshToken } });

		const user = await models.users.findOne({ attributes: ["user_id"], where: { user_id: decoded.user_id } });
		const { accessToken, refreshToken } = generateTokens({ ...user.dataValues });
		const tokenStored = await models.refresh_tokens.create({ token: refreshToken, user_id: user.user_id });
		if (tokenStored)
			res.clearCookie("refresh_token")
				.cookie("refresh_token", refreshToken, cookieOptions)
				.json({ ok: true, accessToken: accessToken });
		else res.json({ ok: false, error: "Uknown error" });
	});
});

module.exports = router;
