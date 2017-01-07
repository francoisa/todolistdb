"use strict";

const sha1 = require('sha1');
const assert = require('assert');
const http = require('http');
const express = require('express');
const app = express();
const DEFAULT_PORT = 3000;

app.set('port', process.env.PORT || DEFAULT_PORT);

// logging
switch(app.get('env')){
    case 'development':
    	// compact, colorful dev logging
    	app.use(require('morgan')('dev'));
      keyspace += '_dev';
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
var keyspace ='todolist_dev';
//const DEFAULT_NODE = '192.168.2.10';
const DEFAULT_NODE = '127.0.0.1';
const node = process.env.NODE || DEFAULT_NODE;
const client = new cassandra.Client({ contactPoints: [node], keyspace: keyspace });

// link API into pipeline
const connect = require('connect');
const bodyParser = require('body-parser');
const rest = require('connect-rest').create(apiOptions);

rest.get('/users', function(req, content, cb) {
  client.connect(function (err) {
    if (err) {
      client.shutdown();
      return console.error('There was an error when connecting', err);
    }
    console.log('Connected to cluster with %d host(s): %j', client.hosts.length, client.hosts.keys());
    const sel_user = 'SELECT username, email, first_name, last_name FROM users';
    client.execute(sel_user, [], { prepare: true }, function(err, result) {
      assert.ifError(err);
      var users = [];
      result.rows.map(function(u) {
        users.push({username: u.username, email: u.email,
            first_name: u.first_name, last_name: u.last_name});
      });
      cb(null, users);
    });
  });
});

rest.get('/user/authenticate/:id/:pwd', function(req, content, cb) {
  client.connect(function (err) {
    if (err) {
      client.shutdown();
      return console.error('There was an error when connecting', err);
    }
    console.log('Connected to cluster with %d host(s): %j', client.hosts.length, client.hosts.keys());
    var id = req.params.id;
    var pwd = req.params.pwd;
    const sel_user = 'SELECT username, email, password, salt FROM users WHERE username = ?';
    client.execute(sel_user, [id], { prepare: true }, function(err, result) {
      assert.ifError(err);
      var user = {result: "ERROR", code: "INVALID_USER"};
      result.rows.map(function(u) {
        var password = sha1(pwd + u.salt);
        if (password === u.password.toString("hex")) {
          user = {result: "SUCCESS", username: u.username, email: u.email,
              first_name: u.first_name, last_name: u.last_name};
        }
        else {
          user = {result: "ERROR", code: "INVALID_PASSWORD"};
        }
      });
      cb(null, user);
    });
  });
});

rest.get('/user/:id', function(req, content, cb) {
  client.connect(function (err) {
    if (err) {
      client.shutdown();
      return console.error('There was an error when connecting', err);
    }
    console.log('Connected to cluster with %d host(s): %j', client.hosts.length, client.hosts.keys());
    var id = req.params.id;
    const sel_user = 'SELECT username, email, first_name, last_name, password, salt FROM users WHERE username = ?';
    client.execute(sel_user, [id], { prepare: true }, function(err, result) {
      assert.ifError(err);
      var user = {result: "ERROR", code: "INVALID_USER"};
      result.rows.map(function(u) {
        user = {username: u.username, email: u.email,
            first_name: u.first_name, last_name: u.last_name};
      });
      cb(null, user);
    });
  });
});

rest.put('/user', function(req, content, cb) {
  client.connect(function (err) {
    if (err) {
      client.shutdown();
      return console.error('There was an error when connecting', err);
    }
    console.log('Connected to cluster with %d host(s): %j', client.hosts.length, client.hosts.keys());
    var id = req.params.id;
    var password = req.params.id;
    var email = req.params.id;
    var first_name = req.params.id;
    var last_name = req.params.id;
    const sel_user = 'SELECT username, email, first_name, last_name, password, salt FROM users WHERE username = ?';
    client.execute(sel_user, [id], { prepare: true }, function(err, result) {
      assert.ifError(err);
      var user = {result: "ERROR", code: "INVALID_USER"};
      result.rows.map(function(u) {
        user = {username: u.username, email: u.email,
            first_name: u.first_name, last_name: u.last_name};
      });
      cb(null, user);
    });
  });
});

rest.post('/user', function(req, content, cb) {
  client.connect(function (err) {
    if (err) {
      client.shutdown();
      return console.error('There was an error when connecting', err);
    }
    console.log('Connected to cluster with %d host(s): %j', client.hosts.length, client.hosts.keys());
    var id = req.params.id;
    const sel_user = 'SELECT username, email, first_name, last_name, password, salt FROM users WHERE username = ?';
    client.execute(sel_user, [id], { prepare: true }, function(err, result) {
      assert.ifError(err);
      var user = {result: "ERROR", code: "INVALID_USER"};
      result.rows.map(function(u) {
        user = {username: u.username, email: u.email,
            first_name: u.first_name, last_name: u.last_name};
      });
      cb(null, user);
    });
  });
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
