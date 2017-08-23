'use strict';

var slack = require('@slack/client')
var IncomingWebhook = slack.IncomingWebhook;
var WebClient = slack.WebClient;
var RtmClient = slack.RtmClient;
var RTM_EVENTS = slack.RTM_EVENTS;
var CLINET_EVENTS = slack.CLIENT_EVENTS;
const MemoryDataStore = slack.MemoryDataStore;



var token = "xoxb-114804840279-HN1gWgllefg7anVdecONEWdn";

var cli = new WebClient("xoxp-113286865425-113895899667-114575409525-cf8c34d3bb2d70554ce1a7e2444077f3");



var message = {
    "text":"hi",
    "attachments":[
        {
            "text":"hello",
            "color":"danger1"

        }
    ]
}


let rtm = new RtmClient(token,{
    logLevel:"error",
    dataStore: new MemoryDataStore(),
    autoReconnect: true,
    autoMark: true
})

rtm.on(CLINET_EVENTS.RTM.RTM_CONNECTION_OPENED,()=>{
    let user = rtm.dataStore.getUserById(rtm.activeUserId);
    let team = rtm.dataStore.getTeamById(rtm.activeTeamId);
    console.log(rtm);
})


rtm.on(RTM_EVENTS.MESSAGE,(message)=>{
    let user = rtm.dataStore.getUserById(message.user);
    if(user && !user.is_bot){
        rtm.sendMessage("hi there","D3C1G2Z35")
    }

})

//rtm.start();

var UI = require('./UI');

function createMessage(){
    return {
        "response_type":"in_channel",
        "attachments":[

            {
                "title":"The Pennsylvanian",
                "title_link":"http://www.apartments.com/the-pennsylvanian-pittsburgh-pa/xtp479p/",
                "image_url":"http://images1.apartments.com/i2/bVGCzMYmBCpZRHGpPAeE5RNgwrU894CTRCyOCD1htbM/110/the-pennsylvanian-pittsburgh-pa-primary-photo.jpg",
                "actions":[
                    {
                        "type":"button",
                        "name":"previous",
                        "value":"previous",
                        "text":"pre",
                        "style":"default"
                    },
                    {
                        "type":"button",
                        "name":"like",
                        "value":"like",
                        "text":"Like",
                        "style":"primary"
                    },
                    {
                        "type":"button",
                        "name":"next",
                        "value":"next",
                        "text":"next",
                        "style":"default"
                    }
                ],
                "callback_id":"apt.json.view"
            }
        ]
    }
}


cli.chat.postMessage("D3C1G2Z35","The following are the cadidate apts",createMessage())

