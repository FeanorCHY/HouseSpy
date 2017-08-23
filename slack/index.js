var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var app = express();

const SLACK_EVENT = require('./util/slack-events');



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.set('port', (process.env.PORT || 5000));

var clientId = '113286865425.114138039170';
var clientSecret = '8a0d52be9868ad25e480bca703307f2f';


var slack = require('@slack/client')
var WebClient = slack.WebClient;



function createMessage(toggle){
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
                        "text": toggle && "Like" || "Unlike",
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



app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.send('Ngrok is working! Path Hit: ' + req.url);
});

// This route handles get request to a /oauth endpoint. We'll use this endpoint for handling the logic of the Slack oAuth process behind our app.
app.get('/oauth', function(req, res) {
    // When a user authorizes an app, a code query parameter is passed on the oAuth endpoint. If that code is not there, we respond with an error message
    if (!req.query.code) {
        res.status(500);
        res.send({"Error": "Looks like we're not getting code."});
        console.log("Looks like we're not getting code.");
    } else {
        // If it's there...

        // We'll do a GET call to Slack's `oauth.access` endpoint, passing our app's client ID, client secret, and the code we just got as query parameters.
        request({
            url: 'https://slack.com/api/oauth.access', //URL to hit
            qs: {code: req.query.code, client_id: clientId, client_secret: clientSecret}, //Query string data
            method: 'GET', //Specify the method

        }, function (error, response, body) {
            if (error) {
                console.log(error);
            } else {
                res.json(body);

            }
        })
    }


});


var result = {
    "text":"your best choice",
    "response_type":"in_channel",
    "attachments":[
        {
            "color": "danger",
            "title":"new apartment",
            "title_link":"http://www.apartments.com/davison-square-pittsburgh-pa/rqd9zm0/",
            "text":"this is @here",
            "image_url":"http://images1.apartments.com/i2/ituFnTO-QCJFInE_dgv3kpFQPGJZUA35-aX71FbjM4o/118/davison-square-pittsburgh-pa.jpg",
            "fields":[
                {
                    "title":"price",
                    "value":125,
                    "short":true
                },{
                    "title":"size",
                    "value":20,
                    "short":true
                },{
                    "title":"address",
                    "value":"240 ave melwood",
                    "short":false
                },{
                    "title":"address",
                    "value":"240 ave melwood",
                    "short":false
                }
            ],
            "actions":[
                {
                    "name":"devare",
                    "text":"Devare",
                    "type":"button",
                    "style":"danger",
                    "value":true

                }
            ],
            "callback_id":"test"
        }
    ]
}


// Route the endpoint that our slash command will point to and send back a simple response to indicate that ngrok is working
app.post('/command', function(req, res) {
    res.setHeader('Content-Type', 'application/json');


    console.log(req.body);
    result["replace_original"] = false;
    res.json(result);
});



app.post("/message_action",(req,res)=>{
    console.log(req.body);
    var payload = JSON.parse(req.body.payload);

    var message_origin = createMessage(!toggle);

    cli.chat.update(payload.message_ts,"D3C1G2Z35",`The following are the cadidate apts ${counter++}`, message_origin)
    res.end();
})


app.post("/event_endpoint",(req,res)=>{
    // var payload = req.body;
    // switch(payload.type){
    //     case SLACK_EVENT.url_verification:
    //         res.setHeader('Content-Type', 'application/x-www-form-urlencoded');
    //         res.end(req.body.challenge)
    //         return;
    //     case SLACK_EVENT.event_callback:
    //         console.log(payload);
    //         break;
    //     default:
    //         console.log(payload);
    // }
    //
    // res.status(200).end();
    
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

