require("dotenv").config();

const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());

let refreshTokens = [];

function authenticateToken(req, res, next) {
	const authorizationHeader = req.headers["authorization"];
	const token = authorizationHeader && authorizationHeader.split(" ")[1];
	if (!token) return res.sendStatus(401);

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
		if (err) return res.sendStatus(403);
		req.user = decoded;
		next();
	});
}

app.post("/login", (req, res) => {
    //Validate user and password
	const user = { id: 2, now: Date.now() };

	const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXP });
	const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXP });

	refreshTokens.push(refreshToken);

	res.cookie("refresh_token", refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
	}).json({ accessToken: accessToken });
});

app.delete("/logout", authenticateToken, (req, res) => {
	const refreshToken = req.cookies.refresh_token;
	refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
	res.clearCookie("refresh_token").json({ message: "Successfully logged out" });
});

app.post("/refresh-token", (req, res) => {
	const refreshToken = req.cookies.refresh_token;
	if (!refreshToken) return res.sendStatus(401);
	if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

	jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
		if (err) return res.sendStatus(403);
		const accessToken = jwt.sign({ id: decoded.id, now: Date.now() }, process.env.ACCESS_TOKEN_SECRET, {
			expiresIn: process.env.ACCESS_TOKEN_EXP,
		});
		res.json({ accessToken: accessToken });
	});
});

//API ROUTES
app.get("/protected", authenticateToken, (req, res) => {
	res.json({ message: "Holi" });
});

app.listen(4000);
