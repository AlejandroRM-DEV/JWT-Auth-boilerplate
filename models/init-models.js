const { DataTypes } = require("sequelize");
const modelRefreshToken = require("./refresh_token.model");
const modelUser = require("./user.model");

function initModels(sequelize) {
	const RefreshToken = modelRefreshToken(sequelize, DataTypes);
	const User = modelUser(sequelize, DataTypes);

	RefreshToken.belongsTo(User, { foreignKey: "user_id", as: "user" });

	return {
		RefreshToken,
		User,
	};
}

module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
