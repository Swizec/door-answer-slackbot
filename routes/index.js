var express = require('express');
var router = express.Router();
const twilio = require('twilio');

let _ = require('lodash');

let settings = require('../settings');

const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

const RtmClient = require('@slack/client').RtmClient,
      WebClient = require('@slack/client').WebClient;

const webSlack = new WebClient(settings.slack.APItoken);

/* GET home page. */
/* Used for testing only */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

/* When Twilio phone number is called */
/* Step 1 */
router.post('/call', function (req, res, next) {
    const caller = req.body.Caller;
    const callSid = req.body.CallSid;

    let twiml = new twilio.TwimlResponse();

    twiml.say('Welcome to Yup! I\'m gonna ask someone to let you in. Please state your name after the beep, then press any key.', {voice: 'alice'});

    twiml.record({
        action: `/call/recording/${callSid}`,
        //transcribe: true,
        //transcribeCallback: `/call/recording/${callSid}`,
        maxLength: 60
    });

    res.type('text/xml');
    res.send(twiml.toString());
});

/* When Twilio sends us the recording */
/* Step 2 */
router.post('/call/recording/:callSid', (req, res, next) => {
    const callSid = req.params.callSid;
    const twiml = new twilio.TwimlResponse();
    const recordingUrl = req.body.RecordingUrl;

    let data = {
        attachments: [{
            fallback: 'Somebody is at the door',
            title: 'Somebody is at the door',
            title_link: recordingUrl,
            text: '@channel Click link to hear the recording',
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

    /* Post on Slack, pause Twilio phone call */
    webSlack.chat.postMessage(settings.slack.channel, '', data, (err, slackRes) => {
        if (err) {
            console.log('Error: ', slackRes);

            twiml.say('Sorry, something went wrong. Please call a real human.', {voice: 'alice'});
        }else{
            console.log('Message sent: ', slackRes);

            twiml.say('Thank you. Please hold.', {voice: 'alice'});
            twiml.pause({length: 240});
            twiml.say('Sorry, nobody pressed the button on Slack. Please call a real human.', {voice: 'alice'});
        }

        res.type('text/xml');
        res.send(twiml.toString());
    });
});

/* When button is clicked on Slack */
/* Step 3 */
router.post('/slack/response', (req, res, next) => {
    const payload = JSON.parse(req.body.payload);

    const callSid = payload.callback_id.split(':')[1];
    const action = payload.actions[0];
    const client = twilio(settings.twilio.accountSid, settings.twilio.authToken);

    let continueAt = '',
        lettingIn = false;

    if (action.value === 'open_door') {
        continueAt = 'call/open_the_door'
        lettingIn = true;
    }else{
        continueAt = 'call/dont_open_door';
        lettingIn = false;
    }

    client.calls(callSid).update({
        url: `https://${settings.hostname}/${continueAt}`,
        method: 'POST'
    }, (err, call) => {
        res.send({
            text: lettingIn ? "Letting them in" : "Telling them to go away"
        });
    });
});

router.get('/handle_slack_callback', (req, res) => {
    console.log(req.session.grant.response);

    res.render('oauth_done', {
        access_token: req.session.grant.response.access_token,
        channel: req.session.grant.response.raw.incoming_webhook.channel,
        team_name: req.session.grant.response.raw.team_name
    });
});

router.post('/call/open_the_door', (req, res, next) => {
    const twiml = new twilio.TwimlResponse();

    twiml.say('Please take the elevator to the 4th flood. Follow the signs for Yup.', {voice: 'alice'});
    twiml.play({digits: 9});

    res.type('text/xml');
    res.send(twiml.toString());
});

router.post('/call/dont_open_door', (req, res, next) => {
    const twiml = new twilio.TwimlResponse();

    twiml.say('Sorry, nobody pressed the button. Try calling a real human.', {voice: 'alice'});

    res.type('text/xml');
    res.send(twiml.toString());
});

module.exports = router;
