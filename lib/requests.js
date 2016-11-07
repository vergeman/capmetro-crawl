const https	= require('https');
const request	= require('request');
const logger	= require('./logger.js');

module.exports = {

    getHeader: function(URL) {

        return new Promise(function(resolve, reject) {

            https.get(URL, function(res) {

                let uuid = res.headers.location.match(/([a-z0-9]+-){4}[a-z0-9]+/)[0];

                resolve(uuid);

            }).on('error', function(err) {

                reject(err);

            });

        });

    },

    getBody: function(URL) {
        //make full request

        return new Promise(function(resolve, reject) {

            logger.info("info", "Requesting vehicle data");

            request(URL, function(err, res, body) {

                if(err) {
                    logger.log('error', "Error requesting vehicle data body");
                    reject(err);
                } else {
                    resolve(JSON.parse(body));
                }

            });
        });

    }
};
