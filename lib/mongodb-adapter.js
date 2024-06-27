const { MongoDatabase } = require("./adapter/mongo");
const { MongoDatabaseWrapper } = require("./adapter/wrapper");

module.exports.MongoDatabase = MongoDatabase;
module.exports.MongoDatabaseWrapper = MongoDatabaseWrapper;
