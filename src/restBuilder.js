"use strict"

const sha1 = require('sha1');
const assert = require('assert');
const http = require('http');
const express = require('express');
const app = express();
const DEFAULT_PORT = 3000;

const cassandra = require('cassandra-driver');
var keyspace ='todolist';
const DEFAULT_NODE = '192.168.2.10';
const node = process.env.NODE || DEFAULT_NODE;
const client = new cassandra.Client({ contactPoints: [node], keyspace: keyspace });


function buildUpRestAPI(rest) {
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
      var params = {};
      console.log( 'Received JSON object:' + JSON.stringify( content ) );
      if (content.password) {
        params['password'] = content.password;
      }
      else {
        params['email'] = content.email;
        params['first_name'] = content.first_name;
        params['last_name'] = content.last_name;
      }
      var param_cql = "";
      var upd_params = [];
      var count = Object.keys(params).length;
      Object.keys(params).forEach (function(p) {
          count--;
          param_cql += p + " = ?";
          if (count !== 0) param_cql += ", ";
          upd_params.push(params[p]);
      });
      upd_params.push(content.username);
      const upd_user = "UPDATE users SET " + param_cql + " WHERE username = ?";
      console.log("upd_user: " + upd_user);
      console.log("upd_params: " + upd_params);
      client.execute(upd_user, upd_params, { prepare: true }, function(err, result) {
        assert.ifError(err);
        var user = {result: "SUCCESS", username: "francoisa"};
        if (err) {
          user = {result: "ERROR", code: "INVALID_USER"};
        }
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
      var username = content.username;
      const sel_user = 'SELECT email FROM users WHERE username = ?';
      client.execute(sel_user, [username], { prepare: true }, function(err, result) {
        assert.ifError(err);
        var user;
        result.rows.map(function(u) {
          user = {result: "ERROR", code: "INVALID_USER"};
        });
        if (user === undefined) {
          var params = [];
          params.push(username);
          var salt = Date.now();
          params.push(salt);
          var password = sha1(content.password + salt);
          var pwdBuffer = Buffer.from(password, "hex");
          params.push(pwdBuffer);
          params.push(content.email);
          params.push(content.first_name);
          params.push(content.last_name);
          const ins_user = 'INSERT INTO users (username, salt, password, email, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)';
          client.execute(ins_user, params, { prepare: true }, function(err, result) {
            assert.ifError(err);
            console.log('Inserted a row.');
          });
          user = {username: content.username, email: content.email,
              first_name: content.first_name, last_name: content.last_name};
        }
        else {
          console.log('User ' + username + ' exists');
        }
        cb(null, user);
      });
    });
  });

  rest.del('/user/:id', function(req, content, cb) {
    client.connect(function (err) {
      if (err) {
        client.shutdown();
        return console.error('There was an error when connecting', err);
      }
      console.log('Connected to cluster with %d host(s): %j', client.hosts.length, client.hosts.keys());
      var id = req.params.id;
      const del_user = 'DELETE FROM users WHERE username = ?';
      client.execute(del_user, [id], { prepare: true }, function(err, result) {
        var user = {result: "ERROR", code: "INVALID_USER"};
        assert.ifError(err);
        user = {result: "SUCCESS", username: id};
        cb(null, user);
      });
    });
  });
}

function getDispatcher (rest) {
	return rest.dispatcher( 'GET', '/dispatcher/:subject', function (req, res, next) {
		res.end( 'Dispatch call made:' + req.params.subject )
	} )
}

exports.buildUpRestAPI = buildUpRestAPI;
exports.getDispatcher = getDispatcher;
