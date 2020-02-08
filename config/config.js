const config = {
  keyPath: "config/private.pem.key",
  certPath: "config/certificate.pem.crt",
  caPath: "config/AmazonRootCA1.pem",
  clientId: "Capstone_Pi",
  host: "a33jti3e3cvwks-ats.iot.us-east-1.amazonaws.com",
  region: "us-east-1",
  baseReconnectTimeMs: 1000,
  lightBulbBearerToken: "ABC",
  lightBulbID: 123
};

module.exports = config;
