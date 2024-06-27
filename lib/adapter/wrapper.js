// eslint-disable-next-line import/no-extraneous-dependencies
const { DatabaseInterface } = require("@dularno/definitions");
const { MongoDatabase } = require("./mongo");

class MongoDatabaseWrapper extends DatabaseInterface {
    constructor(config) {
        super(config);
        this.rdb = new MongoDatabase(config.read);
        this.wdb = new MongoDatabase(config.write);
    }

    async connect() {
        if (!this.rdb.connected) {
            await this.rdb.connect();
        }

        if (this.wdb.connected) {
            await this.wdb.connect();
        }
    }

    async disconnect() {
        await this.rdb.disconnect();
        await this.wdb.disconnect();
    }

    async createCollection(name, options) {
        return this.wdb.createCollection(name, options);
    }

    async hasCollection(name) {
        return this.rdb.hasCollection(name);
    }

    async find(collection, query, options) {
        return this.rdb.find(collection, query, options);
    }

    async findById(collection, id, options) {
        return this.rdb.findById(collection, id, options);
    }

    async create(collection, doc) {
        return this.wdb.create(collection, doc);
    }

    async read(collection, query, options) {
        return this.rdb.read(collection, query, options);
    }

    async update(collection, doc, context) {
        return this.wdb.update(collection, doc, context);
    }

    async delete(collection, query) {
        return this.wdb.delete(collection, query);
    }

    async deleteById(collection, id) {
        return this.rdb.deleteById(collection, id);
    }

    async count(collection, query, options) {
        return this.rdb.count(collection, query, options);
    }

    async initializeModel(dao, modelOptions) {
        return this.wdb.initializeModel(dao, modelOptions);
    }
}

module.exports.MongoDatabaseWrapper = MongoDatabaseWrapper;
