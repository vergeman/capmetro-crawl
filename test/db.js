const config = require('.env.json')[process.env.NODE_ENV];
const assert = require('assert');
const DB = require('lib/db.js');
const DB_NAME = config.DB_NAME;

describe('DB', function() {

    let collections = ['vehicle_positions',
                       'trip_updates'];

    describe('init()', function() {

        it('should return succesfully connect to the intended ' + DB_NAME + ' database', function(done) {

            const DB_URI = "mongodb://localhost:" + [config.DB_PORT, config.DB_NAME].join("/");

            DB.init(DB_URI).then(function(db) {
                assert.equal(db.databaseName, DB_NAME);
                done();
            });
        });

        it('should return an error on a failed connect', function(done) {

            const DB_URI = "mongodb://localhost:" + [9999, config.DB_NAME].join("/");

            DB.init(DB_URI).catch(function(err) {
                assert.equal(Object.keys(err).length > 1, true);
                done();
            });
        });
    });

    describe('buildIndex', function() {

        before(function(done) {
            const DB_URI = "mongodb://localhost:" + [config.DB_PORT, config.DB_NAME].join("/");

            //connect & drop all indices
            DB.init(DB_URI).then(function(db) {

                Promise.all(collections.map(function(collection) {

                    return new Promise(function(resolve, reject) {

                        //create collection
                        db.createCollection(collection, function(err, collection) {

                            //clean of indicies
                            collection.dropAllIndexes(function(err, res) {

                                if (err) { reject(err); }

                                resolve(res);
                            });
                        });
                    });

                })).then(function() {
                    done();
                });;
            });
        });


        it('should succesfully create a headerID_1 index in each collection', function(done) {

            Promise
                .all(collections.map(function(collection) {
                    return DB.buildIndex('headerID', collection);
                }))
                .then(function(results) {
                    results.forEach(function(result) {
                        assert.equal(result, "headerID_1");
                    });
                    done();
                });
        });

    });

    describe('close', function() {

        before(function(done) {
            const DB_URI = "mongodb://localhost:" + [config.DB_PORT, config.DB_NAME].join("/");
            DB.init(DB_URI).then(function(db) {
                done();
            });
        });

        it('closes the db', function() {
            let db = DB.getDB(),
                adminDb = db.admin();
            
            DB.close();

            adminDb.serverStatus(function(err, info) {
                assert.equal(info, null);
            });
        });
    });


    describe('DB getter/setters', function() {

        before(function(done) {
            const DB_URI = "mongodb://localhost:" + [config.DB_PORT, config.DB_NAME].join("/");
            DB.init(DB_URI).then(function(db) {
                done();
            });
        });

        describe('getDB', function() {

            it('returns a connected db instance', function() {

                let db = DB.getDB(),
                    adminDb = db.admin();

                assert.equal(db.databaseName, DB_NAME);

                adminDb.serverStatus(function(err, info) {
                    assert.equal(info.connections.current > 1, true);
                });
            });
        });


        describe ('insertDocuments', function() {

            let collection_name = "vehicle_positions";

            before(function() {
                let db = DB.getDB();
                collections.forEach(function(collection) {
                    db.collection(collection).remove({});
                });
            });

            it('should add a new document to the specified collection in the database', function(done) {

                let db = DB.getDB(),
                    document = {
                        doc: { header: { timestamp : 100 },
                               entity: [{test: "hi"}]
                             },
                        headerID: 123
                    };

                db.collection(collection_name).count().then(function(count) {
                    return DB.insertDocuments(collection_name, document).then(function() {
                        return count;
                    });
                }).then(function(orig_count) {
                    db.collection(collection_name).count().then(function(count) {
                        assert.equal(count == orig_count + 1, true);
                        done();
                    });
                });
            });

            it('should not allow duplicate documents to be added to the db', function(done) {

                let db = DB.getDB(),
                    document = {
                        doc: { header: { timestamp : 100 },
                               entity: [{test: "hi"}]
                             },
                        headerID: 123
                    };

                db.collection(collection_name).count().then(function(count) {
                    return DB.insertDocuments(collection_name, document).then(function() {
                        return count;
                    });
                }).then(function(orig_count) {
                    db.collection(collection_name).count().then(function(count) {
                        assert.equal(count == orig_count, true);
                        done();
                    });
                });
            });
        });

        describe ('findHeaderID', function() {

            let collection_name = "vehicle_positions";

            before(function() {
                let db = DB.getDB();
                db.collection('vehicle_positions').remove({});
            });

            it('should return an empty doc array in document object if headerID does not exist', function(done) {
                let db = DB.getDB();
                let headerID = 123;

                DB.findHeaderID(collection_name, headerID).then(function(result) {
                    assert.equal(headerID === result.headerID, true);
                    assert.equal(result.doc.length === 0, true);
                    done();
                });
            });

            it('should return a doc object alongside the appropriate headerID', function(done) {

                let db = DB.getDB(),
                    headerID = 124,
                    document = {
                        doc: { header: { timestamp : 100 },
                               entity: [{test: "hi"}]
                             },
                        headerID: headerID
                    };

                DB.insertDocuments(collection_name, document).then(function(doc) {
                    return DB.findHeaderID(collection_name, headerID);
                }).then(function(result) {
                    assert.equal(headerID === result.headerID, true);
                    assert.equal(result.doc.length > 0, true);
                    done();
                });

            });


            it('should catch a lookup error', function(done) {
                DB.close();
                DB.findHeaderID(collection_name, "alphabet").catch(function(err) {
                    assert.equal(Object.keys(err).length > 1, true);
                    done();
                });
            });
        });

    });
});
