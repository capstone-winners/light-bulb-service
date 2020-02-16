const lifx = require("node-lifx-lan");
const _ = require("lodash");
const QRCode = require("qrcode");
const awsIot = require("aws-iot-device-sdk");

const config = require("../config/config.js");

class LiFxBulbManager {
  // a LiFx lan device object, cached since discovering devices takes a long time
  bulb = null;
  // The current light bulb state, a JSON object in `capstone-winners` format
  bulbState = null;
  // the AWS IoT device, used for subscribing to MQTT topics
  device = null;

  constructor(deviceName) {
    return (async deviceName => {
      // Discover all available LiFx lights in current LAN, and store the 
      // LiFx object representing the one with the given `deviceName`.
      // Also retrieves the current status of that light bulb.
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
          console.log(`Error: ${err.message}`);
          throw new Error(`Error: ${err.message}`);
        });

      const lifxState = await this.bulb.getLightState();
      // convert LiFx state object to our format
      this.bulbState = lifxStateToCapstone_Yeet(
        lifxState,
        this.bulb.deviceInfo
      );

      // Create the AWS IoT device and subscribe to it's topics
      this.device = awsIot.device({
        keyPath: config.keyPath,
        certPath: config.certPath,
        caPath: config.caPath,
        clientId: config.clientId,
        host: config.host,
      });

      this.device.on("connect", () => {
        console.log("connected");
        this.device.subscribe("light_bulb_actions");
      });

      // bind the `handleAction` function to this `LiFxBulbManager` so that
      // `this` is in the correct context when a message is received and the
      // `handleAction` function is called
      const bindedFunc = this.handleAction.bind(this);
      this.device.on("message", bindedFunc);

      // TODO: remove console.log once we can correctly pad the image. Instead
      // of logging this object, we will display it on the e-ink display.
      console.debug(generateQRCode(this.bulbState));
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
      // the light bulb state has changed
      console.debug("state has changed");
      this.bulbState = newState;
      // TODO: remove console.log once we can correctly pad the image. Instead
      // of logging this object, we will display it on the e-ink display.
      console.debug(generateQRCode(this.bulbState));
    }
  }

  async handleAction(topic, msg) {
    const payload = JSON.parse(msg.toString());

    if (payload["deviceId"] === this.bulbState["super"]["deviceId"]) {
      console.log(`Received a message on topic ${topic} for ${payload["deviceId"]}`);
      if ("setColor" in payload) {
        await this.bulb.setColor({
          color: {
            hue: payload["setColor"]["h"],
            saturation: payload["setColor"]["s"],
            brightness: payload["setColor"]["b"]
          }
        });
      } else if ("setOn" in payload && payload["setOn"] === true) {
        await this.bulb.turnOn();
      } else if ("setOn" in payload && payload["setOn"] === false) {
        await this.bulb.turnOff();
      } else if ("setBrightness" in payload) {
        await this.bulb.setColor({
          color: {
            hue: this.bulbState.color.h,
            saturation: this.bulbState.color.s,
            brightness: payload["setBrightness"],
            kelvin: this.bulbState.color.k,
          }
        });
      }
      // the state has changed, so update the state and generate a new QR code
      this.updateState();
    }
  }
}

async function pollStatus(bulbManager) {
  setTimeout(async () => {
    bulbManager.updateState();
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
      k: 3500 // TODO: change if js/swift side can integrate on this
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
};
