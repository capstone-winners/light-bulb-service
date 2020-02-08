const awsIot = require("aws-iot-device-sdk");
const thingShadow = awsIot.thingShadow;
const config = require("../config/config.js");
const _ = require("lodash");
const lifx = require("node-lifx-lan");
const { LiFxBulbManager, pollStatus, changeBulbColor } = require("./LiFxBulbManager");

async function main() {
  console.log("hello world");
  const bulbManager = await new LiFxBulbManager("Vibe Check ");
  console.log(JSON.stringify(bulbManager.bulbState));

  changeBulbColor(
    bulbManager.bulb,
    { h: 300/360, s: 100/100, b: 50/100 }
  );

  pollStatus(bulbManager);
}

main();
