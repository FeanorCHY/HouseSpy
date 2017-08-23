const Botkit = require("botkit");
const controller = Botkit.slackbot({
    debug:false
})

controller.spawn({
    token:"xoxb-114804840279-HN1gWgllefg7anVdecONEWdn"
}).startRTM();

controller.on("message_received",(bot,message)=>{
    console.log(bot,message);
})

// controller.hears("hello",["direct_message","direct_mention","mention"],(bot,message)=>{
//     bot.reply(message,"hi");
// })