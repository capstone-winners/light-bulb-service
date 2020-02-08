const awsIot = require("aws-iot-device-sdk");
const thingShadow = awsIot.thingShadow;
const QRCode = require("qrcode");
const config = require("../config/config.js");
const _ = require("lodash");
const lifx = require("node-lifx-lan");
const LiFxBulbManager = require("./LiFxBulbManager");
const util = require("./util");

async function main() {
  console.log("hello world");
  //  const states = await getStates();
  //  console.log(states);
  //  generateQRCode(states[0]);
  const bulbManager = await new LiFxBulbManager("Vibe Check ");
  console.log(JSON.stringify(bulbManager));

  while (true) {
    // TODO: add logic for updating after receiving command
    await util.sleep(5000);
    bulbManager.updateState();
    console.log("updated state");
  }
}

main();
