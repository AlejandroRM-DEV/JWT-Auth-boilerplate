exports.hello = async (req, res) => {
	res.json({ ok: true, message: "Hello I'm a protected route" });
};
