var express = require('express');
var router = express.Router();

let _ = require('lodash');

let settings = require('../settings'),
    APItoken = settings.slack_api_token;

const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

let RtmClient = require('@slack/client').RtmClient;
let rtm = new RtmClient(APItoken, {logLevel: 'debug'});
rtm.start();

let CHANNELS = [],
    findChannel = (name) => _.find(CHANNELS, {name: name});

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
    CHANNELS = rtmStartData.channels;
});

/* GET home page. */
router.get('/', function(req, res, next) {

    rtm.sendMessage('this is a test', findChannel('bot-testing').id, () => {

        console.log('message sent');


        res.render('index', { title: 'Express' });
    });
});

module.exports = router;
