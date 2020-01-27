const config = {
   keyPath: "./472e9ea454-private.pem.key",
  certPath: "./472e9ea454-certificate.pem.crt",
    caPath: "rootCA.pem",
    // note: clientId needs to be updated
  clientId: 5,
    // note: not sure wtf the AWS IoT endpoint will be
      host: "bob.com",
};

module.exports = config;