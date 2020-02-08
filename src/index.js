const awsIot = require("aws-iot-device-sdk");
const thingShadow = awsIot.thingShadow;
const QRCode = require("qrcode");
const config = require("config");
const _ = require("lodash");
const lifx  = require('node-lifx-lan');

function generateQRCode(status) {
  // TODO: when using binary data must use a Uint8ClampedArray because:
  // https://www.npmjs.com/package/qrcode#binary-data
  // const dataArray = new Uint8ClampedArray([0, 1, 1, 1, 1, 1]);

  // left for debugging purposes
  // QRCode.toFile("./hi-andrew.png", JSON.stringify(status));

  // TODO: first argument of create can either be a string or a list of objects
  // describing segments of the QR code.... not sure how to do the latter,
  // so just stringify-ing a JSON right now
  return QRCode.create(JSON.stringify(status));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getState(lightBulbId) {
  return 
}

function main() {
  console.log(getState());
}

main();
