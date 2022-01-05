const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
	const authorizationHeader = req.headers.authorization;
	const token = authorizationHeader && authorizationHeader.split(" ")[1];
	if (!token) return res.status(401).json({ ok: false, error: "Unauthorized" });

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
		if (err) return res.status(403).json({ ok: false, error: "Forbidden" });
		req.user = decoded;
		next();
	});
};
