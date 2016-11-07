#Capmetro Crawl

A simple nodeJS experiment to collect capmetro vehicle data.

* Pings the capmetro json endpoint (https://data.texas.gov/download/cuc7-ywmd/text%2Fplain;) and checks the 302 redirect's 'location' header field for a uuid.
* on new uuid, follows the 302 redirect and downloads the data into a mongoDB 'vehicle_positions' collection

##Basic Commands
* `npm start`: starts a one-sec loop
* `npm test`: executes tests
* `npm run coverage`: runs code coverage


Not sure what I want to do with this data at the moment, other than collect it. Perhaps one day this will come in handy.
