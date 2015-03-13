var request = require('request');
var config = require('../../tmp/config');

module.exports = function(collection, docName, data, next) {
  if (docName === 'dojo') return next(); // For frontpage to work w/o auth
  if (!this._user) return next("Not Authenticated");
  if (this._user.permittedDocIds.indexOf(docName) !== -1) return next();
  var _user = this._user;
  var docResource = [config.urls.docs, docName].join('/')
  request.get({
    url: docResource,
    headers: { 'Cookie': _user.cookie }
  }, function(error, response, body) {
    if (error) throw error;
    if (response && response.statusCode === 200) {
      _user.permittedDocIds.push(docName);
      next();
    } else {
      next("Document does not exists or you do not have sufficient permission");
    }
  });
};
