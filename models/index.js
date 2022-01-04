const Sequelize = require("sequelize");
const initModels = require("./init-models");

const sequelize = new Sequelize(process.env.DB_URL);
const models = initModels(sequelize);

module.exports = models;
