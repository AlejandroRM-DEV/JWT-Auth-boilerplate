
module.exports = (sequelize, DataTypes) => sequelize.define(
	"users",
	{
		user_id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		sequelize,
		tableName: "users",
		schema: "public",
		timestamps: false,
	}
);
