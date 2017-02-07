const assert = require('assert');
const Request = require('lib/requests.js');

describe('requests', function() {

    describe('getHeader', function() {

        it('makes a request that succesfully returns a parsed unique uuid', function(done) {

            const URL = 'https://data.texas.gov/download/cuc7-ywmd/text%2Fplain;';
            const collection_name = "vehicle_positions";

            Request.getHeader(collection_name, URL).then(function(uuid) {
                assert(uuid.match(/([a-z0-9]+-){4}[a-z0-9]+/)[0], uuid);
                done();
            });
        });

        it('should have an error obj on a failed connect', function(done) {

            const URL = "https://data.1231231231231.com";
            const collection_name = "vehicle_positions";

            Request.getHeader(collection_name, URL).catch(function(err) {
                assert(Object.keys(err.length > 0, true));
                done();
            });
        });
    });

    describe('getBody', function() {

        it('makes a request that succesfully returns vehicle position information', function(done) {

            const URL = 'https://data.texas.gov/download/cuc7-ywmd/text%2Fplain;';
            const collection_name = "vehicle_positions";

            Request.getBody(collection_name, URL).then(function(body) {

                assert(Number.isInteger(body.header.timestamp), true);
                done();
            });
        });

        it('a failed connect is handled', function(done) {

            const URL = 'https://123123123.xqweq/';
            const collection_name = "vehicle_positions";

            Request.getBody(collection_name, URL).catch(function(err) {
                assert(Object.keys(err.length > 0, true));
                done();
            });

        });
    });

});
