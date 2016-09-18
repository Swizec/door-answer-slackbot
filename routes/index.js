var express = require('express');
var router = express.Router();
const twilio = require('twilio');

let _ = require('lodash');

let settings = require('../settings'),
    APItoken = settings.slack_api_token;

const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

const RtmClient = require('@slack/client').RtmClient,
      WebClient = require('@slack/client').WebClient;

const rtm = new RtmClient(APItoken, {logLevel: 'error'}),
      webSlack = new WebClient(APItoken);

//rtm.start();

//let CHANNELS = [],
//    findChannel = (name) => _.find(CHANNELS, {name: name});

//rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
//    CHANNELS = rtmStartData.channels;
//});

/* GET home page. */
router.get('/', function(req, res, next) {
    let recordingUrl = 'https://google.com';

    let data = {
        attachments: [{
            fallback: 'Somebody is at the door',
            title: 'Somebody is at the door',
            title_link: recordingUrl,
            text: 'Click link to hear the recording',
            actions: [
                {
                    name: 'open_door',
                    text: 'Let them in',
                    type: 'button',
                    value: 'open_door'
                },
                {
                    name: 'deny_access',
                    text: 'Deny access',
                    type: 'button',
                    value: 'deny_access'
                }
            ]
        }]
    };

    /* webSlack.chat.postMessage(findChannel('bot-testing'),
       'test test',
       data, () => { */

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
        transcribe: true,
        transcribeCallback: `/call/recording/${callSid}`,
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
        twiml.say('Thank you', {voice: 'alice'});
        twiml.hangup(callSid);

        res.type('text/xml');
        res.send(twiml.toString());
    });
});

module.exports = router;
