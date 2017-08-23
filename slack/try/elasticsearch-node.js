'use strict'
const elasticsearch = require("elasticsearch")


var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'error'
});


client.search({
    index: 'homespy',
    type: 'logs',
    body: {
        query: {
            match_all: {
            }
        }
    }
}).then(function (resp) {
    var hits = resp.hits;
    console.log(hits);
}, function (err) {
    console.trace(err.message);
});