// Middleware to authenticate user when connecting
// This will enable us to provide Access Control
// to the documents the user is trying to acccess
var request = require('request');

module.exports = function(req, next) {
  if (req.action === 'connect') {
    var rawCookie = req.agent.stream.headers.cookie;
    request.get({
      url: 'http://localhost:3000/me',
      headers: { 'Cookie': rawCookie }
    }, function(error, response, body) {
      if (!error && response && response.statusCode === 200) {
        req.agent._user = JSON.parse(body);
        req.agent._user.cookie = rawCookie;
        req.agent._user.permittedDocIds = [];
      }
      next();
    });
  } else {
    next();
  }
};
