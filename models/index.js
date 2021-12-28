const Sequelize = require("sequelize");
const sequelize = new Sequelize(process.env.DB_URL);

const initModels = require("./init-models");
const models = initModels(sequelize);

module.exports = models;
