'use strict'
const elasticsearch = require("elasticsearch")

const PAGE_SIZE = 10

let PATTERN_PHONE = /\(\d{3}\)\s*\d{3}(-|\s*)\d{4}/

function cleanAptModel(item){
    let apt = item._source
    apt.address = apt.address.replace("\u2013","")
    apt._id = item._id
    apt._highlight = item.highlight
    if(apt.contact === "<UNKNOWN>"){
        let contactMatch = PATTERN_PHONE.exec(apt.description)
        if(contactMatch){
            apt.contact = contactMatch[0]
        }
    }
    return apt
}

class IndexModel {
    constructor(options){
        options = options || {
                host: 'localhost:9200',
                log: 'error'
        }
        this._client = new elasticsearch.Client(options);
        this._options = options
    }

    searchByConditions(condtions,from=0,size=PAGE_SIZE){
        let query = this.createBaseQuery();
        condtions.forEach((condition)=>{
            if(condition.type == "price"){
                this.addPriceFilter(query,condition.data)
            }
            else if(condition.type == "size_type"){
                this.addSizeTypeFilter(query,condition.data)
            }
            else if(condition.type == "text"){
                this.addMatchQuery(query,condition.data)
            }
        })

        this.addHighlight(query)
        query.from = from
        query.size = size

        return this._client.search({
            index: 'homespy',
            type: 'apartment',
            body: query
        })
        
    }

    getSearchIterator(conditions){
        let existing = new Map()
        let bundle = null
        let cursor = PAGE_SIZE
        let page = -1
        let ubound = PAGE_SIZE
        let isEnd = false

        let next = (cb)=>{

            if(isEnd === true){
                return
            }



            if(cursor === ubound){
                page++
                this.searchByConditions(conditions,page * PAGE_SIZE, PAGE_SIZE).then((response)=>{
                    bundle = response.hits.hits
                    if(bundle.length == 0){
                        isEnd = true
                        cb(null)

                    }
                    else{
                        ubound = bundle.length
                        cursor = 0
                        cursor++
                        let name = bundle[cursor-1]._source.name
                        if(name in existing){
                            next(cb)

                        }
                        else{
                            existing[name] = true
                            cb(cleanAptModel(bundle[cursor-1]))
                        }

                    }
                })
            }
            else{
                cursor++
                let name = bundle[cursor-1]._source.name
                if(name in existing){
                    next(cb)

                }
                else{
                    existing[name] = true
                    cb(cleanAptModel(bundle[cursor-1]))
                }

            }
        }


        return {
            next:next
        }
    }

    createBaseQuery(){
        return {
            "query":{
                "bool":{
                    "must":[],
                    "filter":{
                        "bool":{
                            "must":[]
                        }
                    }
                }
            }
        }
    }
    
    addMatchQuery(baseQuery, text){
        baseQuery.query.bool.must.push({
            "multi_match":{
                "query":text,
                "fields":["description"],
                "operator":"and"
            }
        })
    }

    addPriceFilter(baseQuery, price){
        baseQuery.query.bool.filter.bool.must.push({
            "range" : {
                "price" : {
                    "gte" : price[0],
                    "lte" : price[1]
                }
            }
        })
    }

    addSizeTypeFilter(baseQuery,sizeType){
        baseQuery.query.bool.filter.bool.must.push({
            "term":{
                "size_type":sizeType
            }
        })
    }

    addHighlight(baseQuery){
        baseQuery.highlight = {
            "pre_tags": ["`"],
            "post_tags": ["`"],
            "fields": {
                "description":{
                    "fragment_size": 1000,
                    "number_of_fragments": 1
                }
            }
        }
    }
}

// new IndexModel().searchByConditions(
//     [
//         {
//             "type":"text",
//             "data":"pet"
//         },
//         {
//             "type":"price",
//             "data":[900,1000]
//         },
//         {
//             "type":"size_type",
//             "data":"1br1ba"
//         }
//     ],20,10
// )
//     .then(function (resp) {
//         var hits = resp.hits.hits;
//         console.log(hits.map((x)=>x._source.name));
//     }, function (err) {
//         console.trace(err.message);
//     });


// let iter = new IndexModel().getSearchIterator(
//     [
//         {
//             "type":"text",
//             "data":"pet"
//         },
//         {
//             "type":"price",
//             "data":[900,1000]
//         },
//         {
//             "type":"size_type",
//             "data":"1br1ba"
//         }
//     ],
//     (item)=>{
//         console.log(item.name)
//         iter.next()
//     }
// )
//


module.exports = IndexModel