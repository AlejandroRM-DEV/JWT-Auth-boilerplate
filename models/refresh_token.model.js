module.exports = (sequelize, DataTypes) =>
	sequelize.define(
		"RefreshToken",
		{
			user_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			token: {
				type: DataTypes.STRING,
				primaryKey: true,
				allowNull: false,
			},
		},
		{
			sequelize,
			tableName: "refresh_tokens",
			schema: "public",
			timestamps: false,
		}
	);
