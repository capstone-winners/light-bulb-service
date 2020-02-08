const lifx = require("node-lifx-lan");
const _ = require("lodash");
const QRCode = require("qrcode");
const { lifxStateToCapstone_Yeet } = require("./util"); 

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
