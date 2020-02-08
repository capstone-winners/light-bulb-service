const awsIot = require("aws-iot-device-sdk");
const thingShadow = awsIot.thingShadow;
const config = require("../config/config.js");
const _ = require("lodash");
const lifx = require("node-lifx-lan");
const LiFxBulbManager = require("./LiFxBulbManager");
const { lifxStateToCapstone_Yeet } = require("./util");

async function main() {
  console.log("hello world");
  //  const states = await getStates();
  //  console.log(states);
  //  generateQRCode(states[0]);
  const bulbManager = await new LiFxBulbManager("Vibe Check ");
  console.log(JSON.stringify(bulbManager));


  recur(bulbManager);
}

async function recur(bulbManager) {
  // TODO: add logic for updating after receiving command
  setTimeout(async () => {
    const stateResponses = await Promise.all([
      bulbManager.bulb.getLightState(),
      bulbManager.bulb.getDeviceInfo()
    ]);

    const newState = lifxStateToCapstone_Yeet(
      stateResponses[0],
      stateResponses[1]
    );

    if (!_.isEqual(bulbManager.bulbState, newState)) {
      console.log("state has changed");
      // the light bulb state has changed
      bulbManager.bulbState = newState;
      console.log(generateQRCode(bulbManager.bulbState));
    }
    
    recur(bulbManager);
  }, 5000);
}

main();
