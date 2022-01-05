const jwt = require("jsonwebtoken");
const validate = require("validate.js");
const bcrypt = require("bcrypt");
const models = require("../models");

const cookieOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
};

/**
 * You can add more data to access token but keep refresh token to minimum
 */
const generateTokens = (user) => {
	const accessToken = jwt.sign({ user_id: user.user_id, now: Date.now() }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: process.env.ACCESS_TOKEN_EXP,
	});
	const refreshToken = jwt.sign({ user_id: user.user_id, now: Date.now() }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: process.env.REFRESH_TOKEN_EXP,
	});
	return { accessToken, refreshToken };
};

exports.signin = async (req, res) => {
	const data = { email: req.body.email, password: req.body.password };

	const errors = validate(data, {
		email: { presence: { allowEmpty: false }, email: true },
		password: { presence: { allowEmpty: false } },
	});
	if (errors) {
		return res.json({ ok: false, error: errors });
	}

	const prevUser = await models.users.findOne({ attributes: ["user_id"], where: { email: data.email } });
	if (prevUser) {
		return res.json({ ok: false, error: "The email already exists" });
	}

	const newUser = await models.users.create({ ...data, password: bcrypt.hashSync(data.password, 10) });
	if (newUser) {
		return res.json({ ok: true });
	}
	res.json({ ok: false, error: "Uknown error" });
};

exports.login = async (req, res) => {
	const data = { email: req.body.email, password: req.body.password };

	const errors = validate(data, {
		email: { presence: { allowEmpty: false }, email: true },
		password: { presence: { allowEmpty: false } },
	});
	if (errors) {
		return res.json({ ok: false, error: errors });
	}

	const user = await models.users.findOne({ attributes: ["user_id", "password"], where: { email: data.email } });
	if (!user) {
		return res.json({ ok: false, error: "The email does not exists" });
	}
	if (!bcrypt.compareSync(data.password, user.password)) {
		return res.json({ ok: false, error: "Incorrect credentials. Try again" });
	}

	const { accessToken, refreshToken } = generateTokens({ ...user.dataValues });
	const tokenStored = await models.refreshTokens.create({ token: refreshToken, user_id: user.user_id });
	if (tokenStored) {
		return res.cookie("refresh_token", refreshToken, cookieOptions).json({ ok: true, accessToken });
	}
	res.json({ ok: false, error: "Uknown error" });
};

exports.logout = async (req, res) => {
	const refreshToken = req.cookies?.refresh_token || "";
	await models.refreshTokens.destroy({ where: { token: refreshToken } });
	res.clearCookie("refresh_token").json({ ok: true, message: "Successfully logged out" });
};

exports.refreshToken = async (req, res) => {
	const prevRefreshToken = req.cookies?.refresh_token;
	if (!prevRefreshToken) {
		return res.status(401).json({ ok: false, error: "Unauthorized" });
	}

	const token = await models.refreshTokens.findOne({ attributes: ["user_id"], where: { token: prevRefreshToken } });
	if (!token) {
		return res.status(403).json({ ok: false, error: "Forbidden" });
	}

	jwt.verify(prevRefreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
		if (err) {
			return res.status(403).json({ ok: false, error: "Forbidden" });
		}

		await models.refreshTokens.destroy({ where: { token: prevRefreshToken } });

		const user = await models.users.findOne({ attributes: ["user_id"], where: { user_id: decoded.user_id } });
		const { accessToken, refreshToken } = generateTokens({ ...user.dataValues });
		const tokenStored = await models.refreshTokens.create({ token: refreshToken, user_id: user.user_id });
		if (tokenStored) {
			return res
				.clearCookie("refresh_token")
				.cookie("refresh_token", refreshToken, cookieOptions)
				.json({ ok: true, accessToken });
		}
		res.json({ ok: false, error: "Uknown error" });
	});
};
