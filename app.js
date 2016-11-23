/**
 * Capmetro Crawler: grabs Vehicle Position json data and stuffs it into MongoDB
 */

const config = require('./.env.json')[process.env.NODE_ENV || 'dev'];
const logger = require('./lib/logger.js');
const DB = require('./lib/db.js');
const Request = require('./lib/requests.js');

const URL = 'https://data.texas.gov/download/cuc7-ywmd/text%2Fplain;';
const DB_URI = "mongodb://localhost:" + [config.DB_PORT, config.DB_NAME].join("/");

let db = DB.init(DB_URI).then(function(db) {
    return DB.buildIndex('headerID', 'vehicle_positions');
}).catch(function(err) {
    logger.log('error', "exiting - could not required init db");
    process.exit(1);
});


let run = function() {

    Promise
        .all([db, Request.getHeader(URL)])
        .then(function(vals) {
            let headerID = vals[1],
                collection_name = 'vehicle_positions';
            return DB.findHeaderID(collection_name, headerID);
        })
        .then(function(document) {

            // if there is no document, make full data request
            if (document.doc.length === 0) {

                return Request.getBody(URL).then(function(body) {

                    let d = {
                        headerID: document.headerID,
                        doc: body
                    };

                    //insert into db
                    return DB.insertDocuments(d);
                });

            } else {
                logger.log('info', "No new data");
                return Promise.resolve(false);
            }
        })
        .catch(function(err) {
            logger.log('error', err);
        });
};

//shutdown & cleanup
let shutdown = function() {
    logger.log("info", "Caught interrupt signal");
    logger.log("info", "Closing DB");
    let db = DB.getDB();
    db.close();
    process.exit(0);
};

['SIGINT', 'SIGHUP', 'SIGQUIT', 'SIGABRT', 'SIGTERM'].forEach(function(e) {
    process.on(e, shutdown);
});

//run every 5 sec
setInterval(run, 5000);
