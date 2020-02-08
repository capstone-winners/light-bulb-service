const awsIot = require("aws-iot-device-sdk");
const thingShadow = awsIot.thingShadow;
const QRCode = require("qrcode");
const config = require("../config/config.js");
const _ = require("lodash");
const lifx = require("node-lifx-lan");
const LiFxBulbManager = require("./LiFxBulbManager");


function generateQRCode(status) {
  // TODO: when using binary data must use a Uint8ClampedArray because:
  // https://www.npmjs.com/package/qrcode#binary-data
  // const dataArray = new Uint8ClampedArray([0, 1, 1, 1, 1, 1]);

  // left for debugging purposes
  QRCode.toFile("./hack-bean-pot.png", JSON.stringify(status));

  // TODO: first argument of create can either be a string or a list of objects
  // describing segments of the QR code.... not sure how to do the latter,
  // so just stringify-ing a JSON right now
  return QRCode.create(JSON.stringify(status));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Returns an array of Promises, where each promise resolves to a JSON object.
// Each object represents the state of a LIFX bulb in a LAN. The format of the
// the array of JSON objects is:
// [
//  {
//     color: { hue: 0.61181, saturation: 1, brightness: 0.01999, kelvin: 3500 },
//     power: 1,
//     label: 'Vibe Check ',
//     infrared: null,
//     multizone: null,
//     chain: null
//   }
// ]
// for more information on what these fields mean, check out:
// https://www.npmjs.com/package/node-lifx-lan#getlightstate-method
async function getStates() {
  return lifx
    .discover()
    .then(device_list => {
      return Promise.all(device_list.map(device => {
        return device.getLightState();
      }))
    })
    .catch(error => {
      console.error(error);
    });
}


async function main() {
  console.log("hello world");
//  const states = await getStates();
//  console.log(states);
//  generateQRCode(states[0]);
  const bulbManager = await new LiFxBulbManager("Vibe Check ");
  console.log(JSON.stringify(bulbManager));
}

main();
