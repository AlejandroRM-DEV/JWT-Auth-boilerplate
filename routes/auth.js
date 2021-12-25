var router = require('express').Router();
const jwt = require("jsonwebtoken");
const authenticateToken = require("../middlewares/token.middleware");
const validate = require("validate.js");
const bcrypt = require('bcrypt');
const models = require('../models');

let refreshTokens = [];

const cookieOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
};

const generateTokens = (user) => {
	const accessTokenPayload = { id: user.id, iat: Date.now() };
	const refreshTokenPayload = { id: user.id, iat: Date.now() };
	const accessToken = jwt.sign(accessTokenPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXP });
	const refreshToken = jwt.sign(refreshTokenPayload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXP });
	return { accessToken, refreshToken }
}

router.post("/signin", async (req, res) => {
	const data = { email: req.body.email, password: req.body.password }

	const errors = validate(data, {
		email: { presence: { allowEmpty: false }, email: true },
		password: { presence: { allowEmpty: false } }
	});
	if (errors) return res.json({ ok: false, error: errors });

	const prevUser = await models.users.findOne({ attributes: ['user_id'], where: { email: data.email } });
	if (prevUser) return res.json({ ok: false, error: "The email already exists" });

	const newUser = await models.users.create({ ...data, password: bcrypt.hashSync(data.password, 10) }, { fields: ['email', 'password'] });
	if (newUser) res.json({ ok: true, user_id: newUser.user_id });
	else res.json({ ok: false, error: "Uknown error" });
});

router.post("/login", (req, res) => {
	//Validate user and password

	const { accessToken, refreshToken } = generateTokens({ id: 1 });

	refreshTokens.push(refreshToken);

	res.cookie("refresh_token", refreshToken, cookieOptions)
		.json({ accessToken: accessToken });
});

router.delete("/logout", authenticateToken, (req, res) => {
	const refreshToken = req.cookies.refresh_token;
	refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
	res.clearCookie("refresh_token")
		.json({ message: "Successfully logged out" });
});

router.post("/refresh-token", (req, res) => {
	const oldRefreshToken = req.cookies.refresh_token;
	if (!oldRefreshToken) return res.sendStatus(401);
	if (!refreshTokens.includes(oldRefreshToken)) return res.sendStatus(403);

	jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
		if (err) return res.sendStatus(403);
		//Make a new pair of tokens
		const { accessToken, refreshToken } = generateTokens({ id: decoded.id });
		//Blacklist or delete old refresh token and store the new one
		refreshTokens = refreshTokens.filter((token) => token !== oldRefreshToken);
		refreshTokens.push(refreshToken);

		res.clearCookie("refresh_token")
			.cookie("refresh_token", refreshToken, cookieOptions)
			.json({ accessToken: accessToken });
	});
});


module.exports = router;