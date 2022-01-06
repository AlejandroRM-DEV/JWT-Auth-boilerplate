const { DataTypes } = require("sequelize");
const modelRefreshTokens = require("./refresh_tokens.model");
const modelUsers = require("./users.model");

function initModels(sequelize) {
	const refreshTokens = modelRefreshTokens(sequelize, DataTypes);
	const users = modelUsers(sequelize, DataTypes);

	refreshTokens.belongsTo(users, { foreignKey: "user_id", as: "user" });

	return {
		refreshTokens,
		users,
	};
}

module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
