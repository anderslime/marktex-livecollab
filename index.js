// Require
var connect = require('connect');
var cors = require('cors');
var request = require('request');
var compression = require('compression');
var serveStatic = require('serve-static');
var sharejs = require('share')
var mongoURI = process.env['MONGO_URI'];
var config = require('./tmp/config');
var sharePrimus = require('./node_modules/share-primus/lib');
var Primus = require('primus');
var http = require('http');
var ws = require('ws');
var Substream = require('substream');
var access = require('access-control');
var querystring = require('querystring');

var app = connect();

app.use(compression());
app.use(serveStatic('./static'));
app.use(serveStatic(sharejs.scriptsDir));
app.use(serveStatic(sharePrimus.scriptsDir));

// Setup opbeat
var opbeat = require('opbeat')({
	organizationId: process.env.OPBEAT_ORGANIZATION_ID,
	appId: process.env.OPBEAT_APP_ID,
	secretToken: process.env.OPBEAT_SECRET_TOKEN,
	active: process.env['NODE_ENV'] === 'production'
});

var backend = require('./app/backend').build(mongoURI);
backend.addProjection('_users', 'users', 'json0', { x: true });

var cors = access({
	maxAge: '1 hour',
	credentials: true,
	origins: config.corsOrigin,
	headers: ['Cookies']
});
var server = http.createServer(app, function (req, res) {
	if (cors(req, res)) return;

	res.end('hello world');
});

var share = sharejs.server.createClient({ backend:backend });
share.use(require('./app/share_middleware/authentication'));
share.filter(require('./app/share_filter/doc_access_control'));

var primus = new Primus(server, { transformer: 'websockets' });
primus.use('substream', Substream);

primus.on('connection', function (spark) {
	var url = spark.request.url || '';
    var docIdRequested = querystring.parse(url.split('?')[1]).docId;

	share.listen(new sharePrimus.SparkStream(spark.substream('share')), { cookie: spark.headers.cookie || '', docId: docIdRequested, spark: spark });

	var processSpark = spark.substream('process');
	var id = setInterval(function() {
		processSpark.write(JSON.stringify(process.memoryUsage()));
	}, 100);

	spark.on('end', function() {
		console.log('Lost client');
		clearInterval(id);
	});
});

// Run app
var port = process.env.PORT || 7000;

server.listen(port);

console.log("Listening on http://localhost:" + port + "/");
