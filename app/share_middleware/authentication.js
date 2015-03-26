// Middleware to authenticate user when connecting
// This will enable us to provide Access Control
// to the documents the user is trying to acccess
var request = require('request');
var config = require('../../tmp/config');

module.exports = function(req, next) {
  //pass on cookie for filter
  if (req.action === 'connect')
    req.agent.params = { cookie: req.req.cookie, spark: req.req.spark};

  next();
};
