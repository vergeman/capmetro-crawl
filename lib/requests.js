const https	= require('https');
const request	= require('request');
const logger	= require('./logger.js');

module.exports = {

    getHeader: function(intended_collection, URL) {

        return new Promise(function(resolve, reject) {

            https.get(URL, function(res) {

                let uuid = res.headers.location.match(/([a-z0-9]+-){4}[a-z0-9]+/)[0];

                resolve(uuid);

            }).on('error', function(err) {

                logger.log('error', "Error requesting data header for " + intended_collection);

                reject(err);

            });

        });

    },

    getBody: function(intended_collection, URL) {
        //make full request

        return new Promise(function(resolve, reject) {

            logger.info("info", "Requesting data");

            request(URL, function(err, res, body) {

                if(err) {
                    logger.log('error', "Error requesting data body for " + intended_collection);
                    reject(err);
                } else {
                    resolve(JSON.parse(body));
                }

            });
        });

    }
};
