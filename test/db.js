const config = require('.env.json')[process.env.NODE_ENV];
const assert = require('assert');
const DB = require('lib/db.js');
const DB_NAME = config.DB_NAME;

describe('DB', function() {

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
                assert.equal(err.name, 'MongoError');
                done();
            });
        });

    });

    describe('close', function() {

        before(function() {
            const DB_URI = "mongodb://localhost:" + [config.DB_PORT, config.DB_NAME].join("/");
            DB.init(DB_URI);
        });

        it('closes the db', function() {
            let db = DB.getDB(),
                adminDb = db.admin();

            DB.close();

            adminDb.serverStatus(function(err, info) {
                assert(info, null);
            });
        });
    });


    describe('DB getter/setters', function() {

        before(function() {
            const DB_URI = "mongodb://localhost:" + [config.DB_PORT, config.DB_NAME].join("/");
            DB.init(DB_URI);
        });

        describe('getDB', function() {

            it('returns a connected db instance', function() {
                let db = DB.getDB(),
                    adminDb = db.admin();

                assert.equal(db.databaseName, DB_NAME);

                adminDb.serverStatus(function(err, info) {
                    assert(info.connections.current > 1, true);
                });
            });
        });


        describe ('insertDocuments', function() {

            before(function() {
                let db = DB.getDB();
                db.collection('vehicle_positions').remove({});
            });

            it('should add a new document to the database', function(done) {

                let db = DB.getDB(),
                    document = {
                        doc: { header: { timestamp : 100 },
                               entity: [{test: "hi"}]
                             },
                        headerID: 123
                    };

                db.collection('vehicle_positions').count().then(function(count) {
                    return DB.insertDocuments(document).then(function() {
                        return count;
                    });
                }).then(function(orig_count) {
                    db.collection('vehicle_positions').count().then(function(count) {
                        assert(count == orig_count + 1, true);
                        done();
                    });
                });
            });

            it('should not allow duplicates to be added to the db', function(done) {

                let db = DB.getDB(),
                    document = {
                        doc: { header: { timestamp : 100 },
                               entity: [{test: "hi"}]
                             },
                        headerID: 123
                    };

                db.collection('vehicle_positions').count().then(function(count) {
                    return DB.insertDocuments(document).then(function() {
                        return count;
                    });
                }).then(function(orig_count) {
                    db.collection('vehicle_positions').count().then(function(count) {
                        assert(count == orig_count, true);
                        done();
                    });
                });
            });
        });

        describe ('findHeaderID', function() {

            before(function() {
                let db = DB.getDB();
                db.collection('vehicle_positions').remove({});
            });

            it('should return an empty doc array in document object if headerID does not exist', function(done) {
                let db = DB.getDB();
                let headerID = 123;

                DB.findHeaderID('vehicle_positions', headerID).then(function(result) {
                    assert(headerID === result.headerID, true);
                    assert(result.doc.length === 0, true);
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

                DB.insertDocuments(document).then(function(doc) {
                    return DB.findHeaderID('vehicle_positions', headerID);
                }).then(function(result) {
                    assert(headerID === result.headerID, true);
                    assert(result.doc.length > 0, true);
                    done();
                });

            });


            it('should catch a lookup error', function(done) {
                DB.close();
                DB.findHeaderID('vehicle_positions', "alphabet").catch(function(err) {
                    assert(Object.keys(err).length > 1, true);
                    done();
                });
            });
        });

    });
});
