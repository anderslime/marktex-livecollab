var request = require('request');
var config = require('../../tmp/config');

module.exports = function(collection, docName, data, next) {
  if (docName === 'dojo')
    return next(); // For frontpage to work w/o auth

  var that = this;
  if (!this.params.cookie)
    return next(notAuthorized());
  
  var docResource = [config.urls.docs, docName].join('/')
  request.get({
    url: docResource,
    headers: { 'Cookie': this.params.cookie }
  }, function(error, response, body) {
    if (error)
      throw error;
    if (response && response.statusCode === 200)
      next();
    else
      next(notAuthorized());
  });

  function notAuthorized(){
    var goaway = 'Unauthorized';
    that.params.spark.end(goaway);
    return goaway;
  }
};
