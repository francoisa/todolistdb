var http = require('http');
var express = require('express');
var app = express();

app.set('port', process.env.PORT || 3000);

// logging
switch(app.get('env')){
    case 'development':
    	// compact, colorful dev logging
    	app.use(require('morgan')('dev'));
        break;
    case 'production':
        // module 'express-logger' supports daily log rotation
        app.use(require('express-logger')({ path: __dirname + '/log/requests.log'}));
        break;
}

// API configuration
var apiOptions = {
      context: '/api',
      domain: require('domain').create(),
};

apiOptions.domain.on('error', function(err) {
  console.log('API domain error.\n', err.stack);
  setTimeout(function() {
    console.log('Server shutting down after API domain error.');
    process.exit(1);
  }, 5000);
  server.close();
  var worker = require('cluster').worker;
  if(worker) worker.disconnect();
});

const cassandra = require('cassandra-driver');
const client = new cassandra.Client({ contactPoints: ['192.168.2.10'], keyspace: 'todolist' });

// link API into pipeline
var connect = require('connect');
var bodyParser = require('body-parser');
var Rest = require('connect-rest');
var rest = Rest.create(apiOptions);

rest.get('/users', function(req, content, cb) {
  var users = [];
  users[0] = {id: '1', email: 'a@b.com', password: 'asdasd', first_name: 'andre', last_name: 'francois'};
  cb(null, users.map(function(a) {
    return {
      id: a.id,
      email: a.email,
      first_name: a.first_name,
      last_name: a.last_name
    };
  }));
});

app.use(rest.processRequest());

// 404 catch-all handler (middleware)
app.use(function(req, res, next){
	res.status(404);
	res.render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

var server;

function startServer() {
    server = http.createServer(app).listen(app.get('port'), function(){
      console.log( 'Express started in ' + app.get('env') +
        ' mode on http://localhost:' + app.get('port') +
        '; press Ctrl-C to terminate.' );
    });
}

if (require.main === module) {
    // application run directly; start app server
    startServer();
}
else {
    // application imported as a module via "require": export function to create server
    module.exports = startServer;
}
