const lifx = require("node-lifx-lan");
const _ = require("lodash");
const QRCode = require("qrcode");
const awsIot = require("aws-iot-device-sdk");
const { spawn } = require("child_process");

const config = require("../config/config.js");

class LiFxBulbManager {
  // a LiFx lan device object, cached since discovering devices takes a long time
  // https://www.npmjs.com/package/node-lifx-lan#LifxLanDevice-object
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
      this.bulb = discoverLiFxBulb(deviceName);
      // Convert the bulb state into our proprietary capstone winner format
      this.updateState();
      // Create the AWS IoT device and subscribe to it's topics
      this.device = awsIot.device({
        keyPath: config.keyPath,
        certPath: config.certPath,
        caPath: config.caPath,
        clientId: config.clientId,
        host: config.host
      });

      // Subscribe to the 'light' Greengrass message topic
      this.device.on("connect", () => {
        console.log("connected");
        this.device.subscribe("light");
      });

      // bind the `handleAction` function to this `LiFxBulbManager` so that
      // `this` is in the correct context when a message is received and the
      // `handleAction` function is called
      const bindedFunc = this.handleAction.bind(this);
      this.device.on("message", bindedFunc);

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
    ]).catch(err => {
      console.error(err.message);
      generateErrorQRCode(`Could not get status of ${deviceName}`);
    });
    const newState = lifxStateToCapstone_Yeet(
      stateResponses[0],
      stateResponses[1]
    );

    if (!_.isEqual(this.bulbState, newState)) {
      // the light bulb state has changed
      console.debug("State has changed");
      this.bulbState = newState;
      // TODO: remove console.log once we can correctly pad the image. Instead
      // of logging this object, we will display it on the e-ink display.
      generateQRCode(this.bulbState);
    }
  }

  async handleAction(topic, msg) {
    const payload = JSON.parse(msg.toString());

    if (payload["deviceId"] === this.bulbState["super"]["deviceId"]) {
      console.log(
        `Received a message on topic ${topic} for ${payload["deviceId"]}`
      );
      if ("setColor" in payload) {
        await this.bulb
          .setColor({
            color: {
              hue: payload["setColor"]["h"],
              saturation: payload["setColor"]["s"],
              brightness: payload["setColor"]["b"]
            }
          })
          .catch(err => {
            console.error(err.message);
            generateErrorQRCode(`Could not update the color of ${deviceName}`);
          });
      } else if ("setOn" in payload && payload["setOn"] === true) {
        await this.bulb.turnOn().catch(err => {
          console.error(err.message);
          generateErrorQRCode(`Could not turn on ${deviceName}`);
        });
      } else if ("setOn" in payload && payload["setOn"] === false) {
        await this.bulb.turnOff().catch(err => {
          console.error(err.message);
          generateErrorQRCode(`Could not turn off ${deviceName}`);
        });
      } else if ("setBrightness" in payload) {
        await this.bulb
          .setColor({
            color: {
              hue: this.bulbState.color.h,
              saturation: this.bulbState.color.s,
              brightness: payload["setBrightness"],
              kelvin: this.bulbState.color.k
            }
          })
          .catch(err => {
            console.error(err.message);
            generateErrorQRCode(
              `Could not update the brightness of ${deviceName}`
            );
          });
      }
      // the state has changed, so update the state and generate a new QR code
      this.updateState();
    }
  }
}

/**
 * Repeatedly tries to connect to a LiFx bulb with the given bulbName every
 * 2 seconds until connection is successful.
 *
 * @param bulbName        the name of the LiFx bulb.
 * @returns the LiFx bulb object once it's been successfully discovered.
 */
function discoverLiFxBulb(bulbName) {
  setTimeout(async () => {
    const b = discoverLiFxBulbHelper(bulbName);
    if (!_.isNil(b)) {
      console.log(`Discovered a bulb with the name '${bulbName}'`);
      return b;
    }
    discoverLiFxBulb(bulbName);
  }, 2000);
}

/**
 * Attempts to connect to a LiFx bulb with the given bulbName.
 */
async function discoverLiFxBulbHelper(bulbName) {
  return await lifx
    .discover()
    .then(devices => {
      return devices.find(d => d["deviceInfo"]["label"] === deviceName);
    })
    .catch(err => {
      console.error(err.message);
      throw new Error(err.message);
    });
}

/**
 * Polls the given bulbManager for it's status every 10 seconds.
 */
async function pollStatus(bulbManager) {
  setTimeout(async () => {
    bulbManager.updateState();
    pollStatus(bulbManager);
  }, 10000);
}

/**
 * Generate a QR code with an error message.
 */
function generateErrorQRCode(message) {
  const errorObject = { error: message };
  generateQRCode(errorObject);
}

/**
 * Generate a QR Code with the given status. Saves the generated QR code to
 * a file and then calls the Python script with the file name which manipulates
 * the image and then displays it on the e-ink display.
 */
function generateQRCode(status, deviceName) {
  QRCode.toFile(
    `./${deviceName}.bmp`,
    JSON.stringify(status),
    {
      width: 176
    },
    function(err) {
      if (err) throw err;
      console.debug("Saved a qr code from node");
    }
  );
  const pyProg = spawn("python", [
    "../py-resize.py",
    "-f",
    `./${deviceName}.bmp`
  ]);
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
  pollStatus
};
