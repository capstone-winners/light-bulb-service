const awsIot = require("aws-iot-device-sdk");
const thingShadow = awsIot.thingShadow;
const config = require("../config/config.js");
const _ = require("lodash");
const lifx = require("node-lifx-lan");
const { LiFxBulbManager, pollStatus } = require("./LiFxBulbManager");

async function main() {
  console.log("hello world");
  const bulbManager = await new LiFxBulbManager("Vibe Check ");

  pollStatus(bulbManager);
}

main();
