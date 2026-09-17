const app = require('../src/server/server.js').app;

module.exports = (req, res) => {
  return app(req, res);
};
