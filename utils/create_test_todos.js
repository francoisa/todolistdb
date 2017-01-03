const cassandra = require('cassandra-driver');
const assert = require('assert');

const client = new cassandra.Client({ contactPoints: ['192.168.2.10'], keyspace: 'todolist' });

client.connect(function (err) {
  if (err) {
    client.shutdown();
    return console.error('There was an error when connecting', err);
  }
  console.log('Connected to cluster with %d host(s): %j', client.hosts.length, client.hosts.keys());
  console.log('Keyspaces: %j', Object.keys(client.metadata.keyspaces));
  var timeId = cassandra.types.TimeUuid.now() //new instance based on current date
  const ins_todo = 'INSERT INTO todos (username, id, status, content) VALUES (?, ?, ?, ?)';
  const ins_params = [ 'francoisa',  timeId, 0, 'finish rest api' ];
  const sel_todo = 'SELECT * FROM todos WHERE username = ?';
  client.execute(ins_todo, ins_params, { prepare: true }, function(err, result) {
    assert.ifError(err);
    console.log('Inserted a row.');
    client.execute(sel_todo, [ 'francoisa' ], { prepare: true }, function(err, result) {
      assert.ifError(err);
      console.log('got todos for user ' + result.rows[0].username);
      console.log('Shutting down');
      client.shutdown();
    });
  });


});
