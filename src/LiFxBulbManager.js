const lifx = require("node-lifx-lan");
const _ = require("lodash");
const QRCode = require("qrcode");

class LiFxBulbManager {
  bulb = null;
  bulbState = null;

  constructor(deviceName) {
    return (async deviceName => {
      this.bulb = await lifx
        .discover()
        .then(devices => {
          const b = devices.find(d => d["deviceInfo"]["label"] === deviceName);
          if (_.isNil(b)) {
            throw new Error(`Could not find bulb named ${deviceName}`);
          }
          return b;
        })
        .catch(err => {
          throw new Error("Could not discover devices " + err.message);
        });

      const lifxState = await this.bulb.getLightState();
      this.bulbState = lifxStateToCapstone_Yeet(
        lifxState,
        this.bulb.deviceInfo
      );

      // TODO: remove console.log once we convert to bitmap and display on
      // screen
//      console.log(generateQRCode(this.bulbState));
      return this;
    })(deviceName);
  }

  /**
   * Update the internal state by querying LiFx LAN API. If the API returns
   * a different state than what we currently have, update the QR code and
   * display it on the screen.
   */
  async updateState() {
    const stateResponses = await Promise.all([
      this.bulb.getLightState(),
      this.bulb.getDeviceInfo()
    ]);
    const newState = lifxStateToCapstone_Yeet(
      stateResponses[0],
      stateResponses[1]
    );

    if (!_.isEqual(this.bulbState, newState)) {
      console.log("state has changed");
      // the light bulb state has changed
      this.bulbState = newState;
      // TODO: remove console.log once we convert to bitmap and display on
      // screen
      console.log(generateQRCode(this.bulbState));
    }
  }
}

async function pollStatus(bulbManager) {
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
    
    pollStatus(bulbManager);
  }, 10000);
}


function generateQRCode(status) {
  // left for debugging purposes
  /*
  QRCode.toFile('./bitmap.bmp', JSON.stringify(status), {
    "width": 176
  }, function (err) {
    if (err) throw err
    console.log('done')
  })
  */

  // TODO: call python script with QRCode data
  // add zero'ed out buffer around image in Python
  // then display image on e-ink display
  return QRCode.create(JSON.stringify(status));
}

/**
 * Turns the light bulb on... ideally
 */
async function turnBulbOn(bulb) {
  // note this can optionally accept a color and a timeout interval
  await bulb.turnOn();
}

/**
 * Changes the Color of the given bulb to the given color.
 */
async function changeBulbColor(bulb, color) {
  await bulb.setColor({
    color: {
      hue: color["h"],
      saturation: color["s"],
      brightness: color["b"],
    }
  });
}

/**
 * Turns the light bulb off... ideally
 */
async function turnBulbOff(bulb) {
  // note this can also accept a timeout interval
  await bulb.turnOff();
}


/**
 * Convert a LiFx bulb state object to our capstone format.
 * Returns the status object in the `capstone-winners` format.
 * {
 *     "isOn": true,
 *     "brightness": 0.01999,
 *     "color": {
 *        "h": 0,
 *        "s": 0,
 *        "b": 0,
 *        "a": 1,
 *        "k": 3500,
 *     },
 *     "super": {
 *        "status": "ok",
 *        "deviceId": "Vibe Check ",
 *        "deviceType": "light",
 *        "location": "Trap House",
 *        "group": ["Toms Room"]
 *     }
 *  }
 */
function lifxStateToCapstone_Yeet(lifxState, lifxDeviceInfo) {
  return {
    isOn: lifxState.power === 1,
    brightness: lifxState.color.brightness,
    color: {
      h: lifxState.color.hue,
      s: lifxState.color.saturation,
      b: lifxState.color.brightness,
      a: 1, // Do not change
      k: 3500, // TODO: change if js/swift side can integrate on this
    },
    super: {
      status: "ok", // TODO: don't hardcode
      deviceId: lifxState.label,
      deviceType: "light",
      location: lifxDeviceInfo.location.label,
      group: [lifxDeviceInfo.group.label]
    }
  };
}

module.exports = {
  LiFxBulbManager,
  pollStatus,
  changeBulbColor,
  turnBulbOff,
  turnBulbOn,
};
