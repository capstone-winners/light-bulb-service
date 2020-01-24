const QRCode = require('qrcode');

/**
 * Generates a QRCode given a status object.
 * @param {Object} status The status information for a light bulb.
 * @returns A Promise that resolves to the QR Code object or an error.
 */
function generateQR(status) {
    // Uses a Uint8ClampedArray because:
    // https://www.npmjs.com/package/qrcode#binary-data
    // const dataArray = new Uint8ClampedArray([0, 1, 1, 1, 1, 1]);

    console.log(JSON.stringify(QRCode.create(JSON.stringify(status))));
    QRCode.toFile('./hi-andrew.png', JSON.stringify(status));
}


module.exports = { generateQR };