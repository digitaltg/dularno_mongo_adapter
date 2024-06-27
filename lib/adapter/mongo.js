/* eslint-disable no-param-reassign */
const { DatabaseInterface } = require("@dularno/definitions");
const { MongoClient, ObjectId } = require("mongodb");

class MongoDatabase extends DatabaseInterface {
    constructor(config) {
        super(config);

        this.mongoClientClass = config.clientClass
        if (!config.clientClass) {
            this.mongoClientClass = MongoClient;
        }
    }

    /**
     * Connect to the database
     */
    async connect() {
        this.client = new this.mongoClientClass(
            this.config.url,
            this.config.options || {},
        );
        await this.client.connect();
        this.db = this.client.db(this.config.db);
        this.connected = true;

        await this.getCollections();
    }

    /**
     * Ensure that we have a connection to the given database
     */
    async #ensureConnection() {
        if (!this.connected) {
            await this.connect();
        }
    }

    /**
     * Disconnect the current connection
     */
    async disconnect() {
        this.client?.close();
        this.connected = false;
    }

    /**
     * Get all collections from the database
     */
    async getCollections() {
        await this.#ensureConnection();

        // TODO: use cache system
        this.collectionsNames = (await this.db.listCollections().toArray()).map(
            (c) => c.name,
        );
    }

    /**
     * Create a new collection name
     * @param {string} name the name of the new collection
     */
    async createCollection(name) {
        await this.#ensureConnection();
        await this.db.createCollection(name);
    }

    async hasCollection(name) {
        await this.#ensureConnection();
        await this.getCollections();

        return this.collectionsNames.includes(name);
    }

    /**
     * Find a list of document from a collection
     * @param {string} collection
     * @param {*} query
     * @param {*} options
     * @returns
     */
    async find(collection, query, options) {
        await this.#ensureConnection();

        options = options || {};

        let { skip, limit } = options;
        if (!skip) {
            skip = 0;
        }
        if (!limit) {
            limit = 100;
        }

        return this.db
            .collection(collection)
            .find(query, {
                ...options,
                limit,
                skip,
            })
            .sort(options?.order?.sort || {})
            .toArray();
    }

    /**
     * Get a document from a collection by its id
     * @param {string} collection
     * @param {string} id
     * @returns
     */
    async findById(collection, id) {
        await this.#ensureConnection();
        return this.db.collection(collection).findOne({
            _id: this.#toID(id),
        });
    }

    /**
     * Create a new document
     * @param {string} collection
     * @param {Object} doc
     * @returns
     */
    async create(collection, doc) {
        await this.#ensureConnection();

        delete doc.id;
        delete doc._id;

        // Handle owners
        const owners = new Set((doc.owners || []).map((id) => id.toString()));
        doc.owners = Array.from(owners).map((id) => this.#toID(id));

        doc.createdAt = new Date();
        doc.updatedAt = new Date();

        const res = await this.db.collection(collection).insertOne(doc);

        doc.id = res.insertedId.toString();
        return doc;
    }

    /**
     * Get a single document from a collection
     * @param {string} collection
     * @param {Object} query
     * @returns
     */
    async read(collection, query) {
        await this.#ensureConnection();
        return this.db.collection(collection).findOne(query);
    }

    /**
     * Update a single document
     * @param {string} collection
     * @param {Object} doc
     * @returns
     */
    async update(collection, doc) {
        const docId = doc._id.toString();
        delete doc._id;

        // Handle owners
        const owners = new Set((doc.owners || []).map((id) => id.toString()));
        doc.owners = Array.from(owners).map((id) => this.#toID(id));

        await this.db.collection(collection).updateOne(
            {
                _id: this.#toID(docId),
            },
            {
                $set: {
                    ...doc,
                    updatedAt: new Date(),
                },
            },
        );

        doc.id = docId.toString();
        doc._id = docId;

        return doc;
    }

    /**
     * Delete a document from collection
     * @param {string} collection
     * @param {Object} query
     */
    async delete(collection, query) {
        await this.db.collection(collection).deleteMany(query);
    }

    /**
     * Delete a document from collection by id
     * @param {string} collection
     * @param {string} id
     */
    async deleteById(collection, id) {
        await this.db
            .collection(collection)
            .deleteMany({ _id: this.#toID(id) });
    }

    /**
     *
     * @param {string} collection
     * @param {Object} query
     * @param {Object} options
     * @returns
     */
    async count(collection, query, options) {
        return this.db.collection(collection).countDocuments(query, options);
    }

    async initializeModel(dao, modelOptions) {
        await this.#ensureConnection();

        if (modelOptions.name) {
            if (this.collectionsNames.includes(modelOptions.name) === false) {
                await this.createCollection(modelOptions.name);
            }
        }
    }

    /**
     *
     * @param {any} id
     * @returns
     */
    #toID(id) {
        return ObjectId.createFromHexString(id.toString());
    }
}

module.exports.MongoDatabase = MongoDatabase;
