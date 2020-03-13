const awsIot = require("aws-iot-device-sdk");
const thingShadow = awsIot.thingShadow;
const _ = require("lodash");
const lifx = require("node-lifx-lan");
const { LiFxBulbManager, pollStatus } = require("./LiFxBulbManager");

async function main() {
  const bulbManager = await new LiFxBulbManager("vibe-check");

  pollStatus(bulbManager);
}

main();
