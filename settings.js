
module.exports = {
    slack: {
        APIkey: process.env.SLACK_API_KEY || "xoxb-81007518101-qMgnGLW6WMbewe0kk3d3AXNd",
        oauthKey: process.env.SLACK_AOUTH_KEY || '14110144963.81022664631',
        oauthSecret: process.env.SLACK_OAUTH_SECRET || '24df277cd8e3d24e32087885c6ee7c80'
    },
    twilio: {
        accountSid: process.env.TWILIO_SID || '***REMOVED***',
        authToken: process.env.TWILIO_AUTH_TOKEN || '***REMOVED***'
    },
    hostname: process.env.HOSTNAME || 'swizec.ngrok.io'
}
