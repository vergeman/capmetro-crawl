const MongoClient = require('mongodb').MongoClient;
const logger = require('./logger.js');

let _db = {};

module.exports = {

    init: function(DB_URI) {

        return new Promise(function(resolve, reject) {

            MongoClient.connect(DB_URI, function(err, db) {

                _db = db;

                if (err) {
                    logger.log('error', "db connection err: " + DB_URI);
                    reject(err);
                } else {
                    logger.log('info', 'Connected to DB: ' + DB_URI);
                    resolve(db);
                }

            });

        });
    },

    close: function() {
        _db.close();
    },

    getDB: function() {
        return _db;
    },

    findHeaderID: function(collection_name, headerID) {

        let collection = _db.collection(collection_name);

        return new Promise(function(resolve, reject) {

            logger.log("info", "Looking up: " + headerID);

            collection
                .find({"headerID" : {$eq : headerID} })
                .toArray(function(err, doc) {

                    if (err) {
                        logger.log("error", "Error Looking up: " + headerID);
                        reject(err);
                    } else {
                        resolve( {headerID: headerID, doc: doc} );
                    }

                });
        });


    },

    insertDocuments: function(document) {

        let collection = _db.collection('vehicle_positions'),
            id = "" + document.doc.header.timestamp + "";

        return new Promise(function(resolve, reject) {

            collection.find({"_id" : {$eq : id} }).toArray(function(err, doc) {

                if(doc.length) {
                    logger.log('error', id + ": data already exists");
                    logger.log('error', doc.entities);
                    resolve();
                } else {

                    //widen document
                    let doc = {
                        _id: id,
                        entity: document.doc.entity,
                        headerID: document.headerID
                    };

                    // Insert some documents
                    collection.insert(doc, function(err, result) {
                        logger.log('info',
                                   "Inserted Vehicle Positions: " +
                                   doc.headerID + " - " +
                                   doc.entity.length + " entities");

                        resolve(result);
                    });
                }

            });
        });

    }
};