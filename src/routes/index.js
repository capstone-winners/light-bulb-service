const express = require('express');
const router = express.Router();
const QRCode = require('../service/QrCodeGenerator');

router.put('/light/:deviceId/status', function(req, res, next) {
  QRCode.generateQR(req.body);
  res.json({ message: "hello" });
});

module.exports = router;
