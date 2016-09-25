var express = require('express');
var router = express.Router();
const twilio = require('twilio');

let _ = require('lodash');

let settings = require('../settings'),
    APItoken = settings.slack_api_token;

const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

const RtmClient = require('@slack/client').RtmClient,
      WebClient = require('@slack/client').WebClient;

const webSlack = new WebClient(APItoken);


/* GET home page. */
router.get('/', function(req, res, next) {
    let recordingUrl = 'https://google.com';

    let data = {
    "text": "Would you like to play a game?",
    "attachments": [
        {
            "text": "Choose a game to play",
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "chess",
                    "text": "Chess",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "maze",
                    "text": "Falken's Maze",
                    "type": "button",
                    "value": "maze"
                },
                {
                    "name": "war",
                    "text": "Thermonuclear War",
                    "style": "danger",
                    "type": "button",
                    "value": "war",
                    "confirm": {
                        "title": "Are you sure?",
                        "text": "Wouldn't you prefer a good game of chess?",
                        "ok_text": "Yes",
                        "dismiss_text": "No"
                    }
                }
            ]
        }
    ]
}

    webSlack.chat.postMessage('#bot-testing', '', data, () => {

        res.render('index', { title: 'Express' });
    });
});

router.post('/call', function (req, res, next) {
    const caller = req.body.Caller;
    const callSid = req.body.CallSid;

    let twiml = new twilio.TwimlResponse();

    twiml.say('Hello! State your name, then press any key.', {voice: 'alice'});

    twiml.record({
        action: `/call/recording/${callSid}`,
        //transcribe: true,
        //transcribeCallback: `/call/recording/${callSid}`,
        maxLength: 60
    });

    res.type('text/xml');
    res.send(twiml.toString());
});

router.post('/call/recording/:callSid', (req, res, next) => {
    const callSid = req.params.callSid;
    const twiml = new twilio.TwimlResponse();
    const recordingUrl = req.body.RecordingUrl;

    let data = {
        attachments: [{
            fallback: 'Somebody is at the door',
            title: 'Somebody is at the door',
            title_link: recordingUrl,
            text: 'Click link to hear the recording',
            callback_id: `door_open:${callSid}`,
            actions: [
                {
                    name: 'open_door',
                    text: 'Let them in',
                    type: 'button',
                    value: 'open_door'
                },
                {
                    name: 'deny_access',
                    text: 'No.',
                    type: 'button',
                    value: 'deny_access'
                }
            ]
        }]
    };

    webSlack.chat.postMessage('#bot-testing', '', data, () => {
        twiml.say('Thank you. Please hold.', {voice: 'alice'});
        twiml.pause(240);

        res.type('text/xml');
        res.send(twiml.toString());
    });
});

router.post('/slack/response', (req, res, next) => {
    /* const callSid = req.body.callback_id.split(':')[1];
       const action = req.body.actions[0];
       const twiml = new twilio.TwimlResponse();

       if (action.value === 'open_door') {
       //twiml.say
       console.log(callSid, 'open_door');
       }else{
       console.log(callSid, 'deny_access');
       } */

    console.log(req.body);

    res.send({
        text: "pong"
    });
});

module.exports = router;
