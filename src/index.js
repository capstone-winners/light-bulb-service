const awsIot = require("aws-iot-device-sdk");
const thingShadow = awsIot.thingShadow;
const QRCode = require("qrcode");
const config = require("../config/config.js");
const _ = require("lodash");
const lifx = require("node-lifx-lan");

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

// Returns an array of JSON objects, each object represents the state
// of a LIFX bulb in a LAN. The format of the JSON is:
// ...
function getStates() {
  lifx
    .discover()
    .then(device_list => {
      device_list.forEach(async device => {
        console.log(
          [device["ip"], device["mac"], device["deviceInfo"]["label"]].join(
            " | "
          )
        );
        console.log("\n Device object:\n" + JSON.stringify(device));
        const x = await device.getLightState();
        console.log(
          "\n Device state:\n" + JSON.stringify(x)
        );
      });
    })
    .catch(error => {
      console.error(error);
    });
}

function main() {
  console.log("hello world");
  getStates();
}

main();
