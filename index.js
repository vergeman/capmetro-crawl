const request = require('request');
const URL = 'https://data.texas.gov/download/cuc7-ywmd/text%2Fplain;';

//TODO: insert docs into db
//get timestamp
//if new request timestamp > update_last timestamp
//insert doc into db
//update_last timestamp


//TODO: cronify

request(URL, (err, res, body) => {

    let parsed = JSON.parse(body);

    console.log(parsed.header.timestamp)
    console.log(parsed.entity);

    
})

console.log("Done");
