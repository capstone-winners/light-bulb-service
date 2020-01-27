const awsIot = require("aws-iot-device-sdk");
const QRCode = require("qrcode");
const config = require("config");
const _ = require("lodash");

function generateQRCode(status) {
  // TODO: when using binary data must use a Uint8ClampedArray because:
  // https://www.npmjs.com/package/qrcode#binary-data
  // const dataArray = new Uint8ClampedArray([0, 1, 1, 1, 1, 1]);

  // left for debugging purposes
  // QRCode.toFile("./hi-andrew.png", JSON.stringify(status));

  // TODO: first argument of create can either be a string or a list of objects
  // describing segments of the QR code.... not sure how to do the latter,
  // so just stringify-ing a JSON right now
  return QRCode.create(JSON.stringify(status));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function main() {
  const device = awsIot.device({
    keyPath: config.keyPath,
    certPath: config.certPath,
    caPath: config.caPath,
    clientId: config.clientId,
    host: config.host
  });

  device.on("connect", function() {
    console.log("connected");
    device.subscribe("iot_commands");

    // TODO: this should get the status from light-bulb API (eg Philips Hue)
    const status = {
      id: 1,
      deviceType: "light-bulb",
      isOn: false,
      brightness: 255,
      color: "rgb(10, 155, 195)"
    };

    // TODO: this should send the QR code object to the screen to display
    // there may be many ways of doing this, including changing QRCode.create
    // to QRCode.toFile if that's easy and clean
    console.log(generateQRCode(status));
  });

  // Every 5 mins poll the light-bulb API and get a new status/QRCode.
  // TODO: how to regularly update the light-bulb status/QRCode without doing
  // this ugly shit?
  while (true) {
      await sleep(300000);
      // TODO: get new status
      newStatus = { id: 2 };
      if (!_.isEqual(status, newStatus)) {
          status = newStatus;
          console.log(generateQRCode(status));
      }
  }
}


main();
