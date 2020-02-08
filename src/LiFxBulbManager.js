const lifx = require("node-lifx-lan");
const _ = require("lodash");
const colorConverter = require("color-convert");

function generateQRCode(status) {
  // left for debugging purposes
  //  QRCode.toFile("./hack-bean-pot.png", JSON.stringify(status));

  // TODO: convert to bitmap then ???? => display on screen
  return QRCode.create(JSON.stringify(status));
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
      return Promise.all(
        device_list.map(device => {
          return device.getLightState();
        })
      );
    })
    .catch(error => {
      console.error(error);
    });
}

/**
 * Convert a LiFx bulb state object to our capstone format.
 * Returns the status object in the `capstone-winners` format.
 * {
 *     "isOn": true,
 *     "brightness": 0.01999,
 *     "color": {
 *        "r": 0,
 *        "g": 0,
 *        "b": 0,
 *        "a": 1
 *     },
 *     "super": {
 *        "status": "ok",
 *        "deviceId": "Vibe Check ",
 *        "deviceType": "lightbulb",
 *        "location": "Trap House",
 *        "group": "Toms Room"
 *     }
 *  }
 */
function lifxStateToCapstone_Yeet(lifxState, lifxDeviceInfo) {
  const rgb = colorConverter.hsl.rgb(
    lifxState.color.hue,
    lifxState.color.saturation,
    lifxState.color.brightness
  );
  return {
    isOn: lifxState.power === 1,
    brightness: lifxState.color.brightness,
    color: { r: rgb[0], g: rgb[1], b: rgb[2], a: 1 },
    super: {
      status: "ok", // TODO: don't hardcode
      deviceId: lifxState.label,
      deviceType: "lightbulb",
      location: lifxDeviceInfo.location.label,
      group: lifxDeviceInfo.group.label
    }
  };
}

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
      console.log(generateQRCode(this.bulbState));
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
      console.log(generateQRCode(this.bulbState));
    }
  }
}

module.exports = LiFxBulbManager;
