const cassandra = require('cassandra-driver');
const sha1 = require('sha1');
const assert = require('assert');

const client = new cassandra.Client({ contactPoints: ['192.168.2.10'], keyspace: 'todolist' });

client.connect(function (err) {
  if (err) {
    client.shutdown();
    return console.error('There was an error when connecting', err);
  }
  console.log('Connected to cluster with %d host(s): %j', client.hosts.length, client.hosts.keys());
  console.log('Keyspaces: %j', Object.keys(client.metadata.keyspaces));
  var password = sha1("password");
  var pwdBuffer = Buffer.from(password, "hex");
  const ins_user = 'INSERT INTO users (username, password, email, first_name, last_name) VALUES (?, ?, ?, ?, ?)';
  const ins_params = [ 'francoisa',  pwdBuffer, 'andre.francois@gmail.com', 'andre', 'francois' ];
  const sel_user = 'SELECT * FROM users WHERE username = ?';
  client.execute(ins_user, ins_params, { prepare: true }, function(err, result) {
    assert.ifError(err);
    console.log('Inserted a row.');
    client.execute(sel_user, [ 'francoisa' ], { prepare: true }, function(err, result) {
      assert.ifError(err);
      console.log('got user profile with email ' + result.rows[0].email);
      console.log('Shutting down');
      client.shutdown();
    });
  });


});
