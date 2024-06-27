// eslint-disable-next-line import/no-extraneous-dependencies
const { MongoMemoryServer } = require("mongodb-memory-server");

const { MongoDatabase } = require("..");
const { MongoClient } = require("mongodb");

const COLLECTION_NAME = "testAdapter";

describe("[DULARNO] Mongodb adapter", () => {
    let mongod = null;
    let mongodUri = null;
    let mongoDatabase = null;

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        mongodUri = mongod.getUri();

        // The Server can be stopped again with
    });

    afterAll(async () => {
        await mongod.stop();
    });

    beforeEach(async () => {
        mongoDatabase = new MongoDatabase({
            clientClass: MongoClient,
            url: mongodUri,
        });

        await mongoDatabase.connect();
    });

    afterEach(async () => {
        await mongoDatabase.disconnect();
    });

    test("Should create collection", async () => {
        await mongoDatabase.createCollection(COLLECTION_NAME);
        const r = await mongoDatabase.hasCollection(COLLECTION_NAME);
        expect(r).toBe(true);
    });
});
