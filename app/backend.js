var livedb = require('livedb');

module.exports = {
  build: function(mongoURI) {
    if (mongoURI) {
      console.log("Building backend using MongoDB");
      var livedbMongo = require('livedb-mongo')(mongoURI, { safe: true });
      return livedb.client(livedbMongo);
    } else {
      console.log("Building backend using Memory");
      return livedb.client(livedb.memory());
    }
  }
}
