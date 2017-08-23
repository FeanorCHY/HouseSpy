'use strict'
const fs = require("fs")
const path = require("path")
const _ = require("lodash")


fs.readdirSync(__dirname).filter((x)=>{
    if(path.extname(x) === ".json"){
        let UIName = x.substring(0,x.length - 5)
        exports[UIName] = require(path.join(__dirname,x))
    }
})

exports.createApt = function (apt){
    let _ui = {
        "response_type":"in_channel",
        "attachments":[

            {
                "title":apt.name,
                "title_link":apt.src,
                "fields":[
                    {
                        "title":":moneybag:price",
                        "value":`\$${apt.price}`,
                        "short":true
                    },
                    {
                        "title":"size",
                        "value":apt.size_type,
                        "short":true
                    },
                    {
                        "title":":house:address",
                        "value":apt.address,
                        "short":false
                    },
                    {
                        "title":":telephone_receiver:contact",
                        "value":apt.contact,
                        "short":true
                    }
                ],
                "actions":[
                    {
                        "type":"button",
                        "name":"like",
                        "value":"like",
                        "text": ":heart:",
                        "style":"primary"
                    },
                    {
                        "type":"button",
                        "name":"toggle_details",
                        "value":"detail",
                        "text": "details...",
                        "style":"default"
                    },
                    {
                        "type":"button",
                        "name":"next_apt",
                        "value":"next_apt",
                        "text":"next apartment...",
                        "style":"default"
                    },
                    {
                        "type":"button",
                        "name":"done",
                        "value":"done",
                        "text":"done",
                        "style":"danger"
                    }
                ],
                "color":"red",
                "callback_id":"apt.search.iterate"
            }
        ]
    }

    return {
        ui(){
            return _ui
        },
        setMessage(message){
            this._message = message
        },
        getMessage(){
          return this._message
        },
        toggleDetails(){
            let toggleButton = _ui.attachments[0].actions[1]

            if(this._text == null){
                this._text = "*Details*:\n" + (apt._highlight && apt._highlight.description || apt.description)
                toggleButton.text = "close..."
            }
            else{
                this._text = null
                toggleButton.text = "details..."
            }
        },
        getText(){
            return this._text || ""
        }
    }
}

exports.createAptImage = function (images){
    images = _.uniq(images)
    let cursor = 0
    let hasPrevious = false
    let hasNext = true


    let _ui_prev_button =  {
            "type":"button",
            "name":"image_prev",
            "value":"prev",
            "text": "prev",
            "style":"default"
        }
    let _ui_next_button = {
        "type":"button",
        "name":"image_next",
        "value":"next",
        "text": "next",
        "style":"default"
    }

    let _ui = {
        "response_type":"in_channel",
        "attachments":[
            {
                "title":"images",
                "image_url":images[cursor],
                "callback_id":"apt.search.iterate",
                "actions":[_ui_prev_button,_ui_next_button]
            }
        ]
    }
    return {
        previous:()=>{
            if(cursor > 0){
                _ui.attachments[0].image_url = images[--cursor]
            }
        },
        setMessage(message){
            this._message = message
        },
        getMessage(){
            return this._message
        },
        next:()=>{
            if(cursor < images.length-1){
                _ui.attachments[0].image_url = images[++cursor]
            }
        },
        ui:()=>{
            return _ui
        }
    }
}