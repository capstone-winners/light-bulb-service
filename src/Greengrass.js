const ggSdk = require('aws-greengrass-core-sdk');

const iotClient = new ggSdk.IotData();

function publishCallback(err, data) {
    console.log(err);
    console.log(data);
}

const myPlatform = util.format('%s-%s', os.platform(), os.release());
const pubOpt = {
    topic: 'hello/world',
    payload: JSON.stringify({ message: 'hi', myPlatform }),
    queueFullPolicy: 'AllOrError',
};

function greengrassHelloWorldRun() {
    
    iotClient.publish(pubOpt, publishCallback);
}

// Schedule the job to run every 5 seconds
setInterval(greengrassHelloWorldRun, 5000);

// This is a handler which does nothing for this example
exports.handler = function handler(event, context) {
    console.log(event);
    console.log(context);
};
