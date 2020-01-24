
const QRCode = require('qrcode');

exports.handler = async function(event, context) {
    // Uses a Uint8ClampedArray because:
    // https://www.npmjs.com/package/qrcode#binary-data
    // const dataArray = new Uint8ClampedArray([0, 1, 1, 1, 1, 1]);

    console.log(JSON.stringify(QRCode.create(JSON.stringify(status))));
    QRCode.toFile('./hi-andrew.png', JSON.stringify(status));
    return context.logStreamName
}
