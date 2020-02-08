const colorConverter = require("color-convert");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

module.exports = { sleep, lifxStateToCapstone_Yeet };
