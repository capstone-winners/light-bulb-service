
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
 *        "a": 1
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
      a: 1
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

module.exports = { lifxStateToCapstone_Yeet };
