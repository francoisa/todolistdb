"use strict"

const http = require('http');

let connect = require('connect'),
	cookieParser = require('cookie-parser'),
	cookieSession = require('cookie-session'),
	compression = require('compression'),
	timeout = require('connect-timeout'),
	bodyParser = require('body-parser');
//	serveStatic = require('serve-static'),

let Rest = require('connect-rest');
let restBuilder = require('./restBuilder');

let app = connect()
	.use(compression())
	.use(timeout(2000))
	.use(bodyParser.urlencoded({ extended: true }))
	.use(bodyParser.json());

/*
let app = connect()
	.use(compression())
	.use(timeout(2000))
	.use(cookieParser('secretPass'))
	.use(cookieSession({
		name: 'demo.sid',
		secret: 'secretPass',
		cookie: { httpOnly: true }
	}))
	.use(bodyParser.urlencoded({ extended: true }))
	.use(bodyParser.json());
*/
let options = {
  	context: '/api',
  	logger: { file: 'server.log', level: 'debug' },
    apiKeys: [ '849b7648-14b8-4154-9ef2-8d1dc4c2b7e9' ],
  	discoverPath: 'discover',
  	protoPath: 'proto',
  	loose: { after: 1000 },
  	domain: true
}

var rest = Rest.create(options);
app.use(rest.processRequest());
app.use(restBuilder.getDispatcher(Rest));

restBuilder.buildUpRestAPI(rest);

let port = process.env.PORT || 3000;
let server = http.createServer(app);

server.listen(port, function () {
	console.log('Running on http://localhost:' + port)
});
