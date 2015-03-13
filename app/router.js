var browserChannel = require('browserchannel').server;
var Duplex = require('stream').Duplex;

var numClients = 0;

module.exports = function(webserver, shareServer) {
  return browserChannel({
    webserver: webserver,
    sessionTimeoutInterval: 5000,
    corsAllowCredentials: true,
    cors: "http://localhost:9000"
  }, function(client) {
    var stream;
    numClients++;
    stream = new Duplex({ objectMode: true });
    stream._write = function(chunk, encoding, callback) {
      console.log('s->c ', JSON.stringify(chunk));
      if (client.state !== 'closed') {
        client.send(chunk);
      }
      return callback();
    };
    stream._read = function() {};
    stream.headers = client.headers;
    stream.remoteAddress = stream.address;
    client.on('message', function(data) {
      console.log('c->s ', JSON.stringify(data));
      return stream.push(data);
    });
    stream.on('error', function(msg) {
      return client.stop();
    });
    client.on('close', function(reason) {
      stream.push(null);
      stream.emit('close');
      numClients--;
      return console.log('client went away', numClients);
    });
    stream.on('end', function() {
      return client.close();
    });
    return shareServer.listen(stream);
  });
};
