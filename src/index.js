const awsIot = require("aws-iot-device-sdk");
const thingShadow = awsIot.thingShadow;
const _ = require("lodash");
const lifx = require("node-lifx-lan");
const {
  LiFxBulbManager,
  pollStatus,
  turnBulbOn
} = require("./LiFxBulbManager");

async function main() {
  console.log("hello world");
  const bulbManager = await new LiFxBulbManager("Vibe Check ");
  console.log(JSON.stringify(bulbManager.bulbState));

  turnBulbOn(bulbManager.bulb);

  pollStatus(bulbManager);
}

main();
