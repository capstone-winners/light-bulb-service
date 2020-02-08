const lifx = require("node-lifx-lan");
const _ = require("lodash");
const colorConverter = require("color-convert");

/**
 * Convert a LiFx bulb state object to our capstone format.
 * Returns the `capstone-winners` format.
 */
function lifxStateToCapstone_Yeet(lifxState, lifxDeviceInfo) {
  console.log(JSON.stringify(lifxDeviceInfo));
  const rgb = colorConverter.hsl.rgb(lifxState.color.hue,
    lifxState.color.saturation,
    lifxState.color.brightness);
  return {
    isOn: lifxState.power === 1,
    brightness: lifxState.color.brightness,
    color: { r: rgb[0], g: rgb[1], b: rgb[2], a: 1 },
    super: {
      status: "ok", // TODO: don't hardcode
      deviceId: lifxState.label,
      deviceType: "lightbulb",
      location: lifxDeviceInfo.location.label,
      group: lifxDeviceInfo.group.label,
    }
  }
}

class LiFxBulbManager {
  bulb = null;
  bulbState = null;

  constructor(deviceName) {
    return (async deviceName => {
      this.bulb = await lifx
        .discover()
        .then(devices => {
          const b = devices.find(
            d => d["deviceInfo"]["label"] === deviceName
          );
          if (_.isNil(b)) {
            throw new Error(`Could not find bulb named ${deviceName}`);
          }
          return b;
        })
        .catch(err => {
          throw new Error("Could not discover devices " + err.message);
        });
      const lifxState = await this.bulb.getLightState();
      this.bulbState = lifxStateToCapstone_Yeet(lifxState, this.bulb.deviceInfo);
      return this;
    })(deviceName);
  }
}

module.exports = LiFxBulbManager;
