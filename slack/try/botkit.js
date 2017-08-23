'use strict'

const Botkit = require("botkit");
var path = require('path');


const config = require("./config.json");
const UI = require("./data/UI");
const Cache = require("./model/Cache");
const StateMachine = require("./model/StateMachine")
const IndexModel = require("./model/IndexModel")


let cache = new Cache();
cache.load(path.join(__dirname,"db/cache.json"));



function extractConditions(text){
    if(text.indexOf(",")){
        return text.split(",").map((x)=>extractOneCondition(x)).filter((x)=>x)
    }
    else{
        return [extractOneCondition(text)]
    }
}

function extractOneCondition(text){
    let match =null
    if(match= /price (\d+)\s*~\s*(\d+)/.exec(text)){
        return {
            type:"price",
            data:match.slice(1,3)
        }

    }
    else if(match= /(\dbr\dba)/i.exec(text)) {
        return {
            type: "size_type",
            data: match[1].toLowerCase()
        }
    }
    else{
        return {
            type:"text",
            data: text.split(/\s+/).map((x)=>x.trim()).filter(x=>x).join(" ")
        }
    }
}


let state = new StateMachine(
    {
        states:{
            "apt.search.iterate":{
                do:function(){

                    if(this.isFirst || this.callback_id === "apt.search.iterate"){

                        if(this.isFirst || this.action.name == "next_apt"){
                            this.isFirst = false
                            this.iter.next((apt)=>{
                                if(apt){

                                    let ui_apt = UI.createApt(apt)
                                    let ui_aptImage = UI.createAptImage(apt.images)
                                    this.setContext({
                                        ui:{
                                            apt:ui_apt,
                                            aptImage:ui_aptImage
                                        }
                                    })
                                    this.bot.reply(this.message,ui_apt.ui(),(err,response)=>{
                                        ui_apt.setMessage(response)
                                    })
                                    this.bot.reply(this.message,ui_aptImage.ui(),(err,response)=>{
                                        ui_aptImage.setMessage(response)
                                    })
                                }
                                else{
                                    this.bot.reply(this.message,"no more result")
                                    this.to("apt.search.init")
                                }
                            })
                        }
                        else if(this.action.name === "toggle_details"){
                            this.ui.apt.toggleDetails()
                            let m = this.ui.apt.getMessage()
                            this.bot.api.chat.update({
                                ts:m.ts,
                                channel:m.channel,
                                attachments: this.ui.apt.ui().attachments,
                                text:this.ui.apt.getText()
                            })
                        }
                        else if(this.action.name === "image_prev"){
                            this.ui.aptImage.previous()
                            let m = this.ui.aptImage.getMessage()
                            this.bot.api.chat.update({
                                ts:m.ts,
                                channel:m.channel,
                                attachments: this.ui.aptImage.ui().attachments
                            })
                        }
                        else if(this.action.name === "image_next"){
                            this.ui.aptImage.next()
                            let m = this.ui.aptImage.getMessage()
                            this.bot.api.chat.update({
                                ts:m.ts,
                                channel:m.channel,
                                attachments: this.ui.aptImage.ui().attachments
                            })
                        }
                        else if(this.action.name === "done"){

                            this.to("apt.search.init")
                            this.process()
                        }
                    }
                    else{

                    }


                },
                enter(){

                }
            },
            "apt.search.init":{
                enter:function(){
                    this.setContext({
                        state:"init"
                    })
                },
                do:function(){
                    if(this.state === "init"){
                        this.bot.reply(this.message, UI.aptInit)
                        this.setContext({
                            state:"waitForAnswer"
                        })
                    }
                    else if(this.state === "waitForAnswer"){
                        let conditions = extractConditions(this.message.text)
                        console.log(conditions);


                        let iter = new IndexModel().getSearchIterator(conditions)
                        this.setContext({
                            iter:iter,
                            isFirst:true
                        })
                        this.to("apt.search.iterate")
                        this.process()
                    }

                },
                exit:function(){

                }
            },
            "default":{
                do:function(){
                    if(this.callback_id){
                        this.to(this.action.value)
                        this.process()
                    }
                    else{
                        this.bot.reply(this.message, UI.welcome);
                    }
                }
            }

        },
        context:{

        }
    }
)




let controller = Botkit.slackbot({
    json_file_store: path.resolve(__dirname,"db"),
    require_delivery:true
})

controller.configureSlackApp({
    clientId:config.clientId,
    clientSecret:config.clientSecret,
    scopes:["bot"]
})

controller.setupWebserver(config.port,(err, server)=> {
    controller.createHomepageEndpoint(controller.webserver)
    controller.createOauthEndpoints(controller.webserver,(err,req,res)=>{
        if (err) {
            res.status(500).send('ERROR: ' + err);
        } else {
            res.send('Success!');
        }
    })
    controller.createWebhookEndpoints(controller.webserver)
})


controller.on("interactive_message_callback",(bot,message)=>{
    //console.log(message);

    state.setContext({
        callback_id:message.callback_id,
        action:message.actions[0],
        message:message,
        bot:bot
    })

    state.process()



    // if(message.callback_id == "welcome"){
    //     if(message.actions[0].name == "find_apartment"){
    //         if(!cache.hasUser(message.user)){
    //             cache.addUser(message.user)
    //         }
    //
    //         cache.get(message.user)["status"] = Cache.status.APT_FIND
    //
    //         bot.reply(message,{
    //
    //             "attachments":[
    //                 {
    //                     "title":"let me know more about what you need to help you find the apartment!",
    //                     "text":"some hints (reply with the following words)\nprice 600~900\nsize 1B1B"
    //                 }
    //             ]
    //         });
    //     }
    // }
    // else if(message.callback_id == "apt.search.main"){
    //     if(message.actions[0].name == "like"){
    //
    //         let aptMessage = cache.get(message.user).data.apt
    //         UI.apt.attachments[0].actions[0].text = "Unlike"
    //         bot.api.chat.update({
    //             "ts":aptMessage.ts,
    //             "channel":aptMessage.channel,
    //             "attachments": UI.apt.attachments
    //         });
    //     }
    // }
    // else{
    //     bot.reply(message, "sorry, I don't know what to do")
    // }


})





controller.hears("",["direct_message","direct_mention","mention"],(bot,message)=>{

    state.setContext({
        bot,
        message,
        callback_id:null,
        action:null
    })

    state.process()

    // cache.addUserIfNotExists(message.user)
    // let user = cache.get(message.user)
    //
    // if(user.status === Cache.status.IDLE){
    //     bot.reply(message,UI.welcome)
    // }
    // else if (user.status === Cache.status.APT_FIND){
    //     bot.reply(message, UI.apt, cache.recordMessage(user,"apt"))
    //     bot.reply(message, UI.aptImage, cache.recordMessage(user,"apt.image"))
    // }
    // //console.log(message);

})





let slack = controller.spawn({
    token:config.token_bot
})

slack.startRTM();
