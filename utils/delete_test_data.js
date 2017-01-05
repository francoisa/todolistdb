const cassandra = require('cassandra-driver');
const assert = require('assert');

var delete_todos = function(todolist, delete_users, shutdown_db) {
  const del_todo = 'DELETE FROM todos WHERE username = ?';
  todolist.execute(del_todo, ['francoisa'], { prepare: true }, function(err, result) {
    if (err) {
      client.shutdown();
      return console.error('There was an error when connecting', err);
    }
    console.log('Deleted todos row.');
    delete_users(todolist, shutdown_db);
  });
};

var delete_users = function(todolist, shutdown_db) {
  const del_todo = 'DELETE FROM users WHERE username = ?';
  todolist.execute(del_todo, ['francoisa'], { prepare: true }, function(err, result) {
    if (err) {
      client.shutdown();
      return console.error('There was an error when connecting', err);
    }
    console.log('Deleted users row.');
    shutdown_db(todolist);
  });
};

var shutdown_db = function(todolist) {
  console.log('Shutting down');
  todolist.shutdown();
}

const client = new cassandra.Client({ contactPoints: ['192.168.2.10'], keyspace: 'todolist' });
client.connect(function (err) {
  if (err) {
    client.shutdown();
    return console.error('There was an error when connecting', err);
  }
  console.log('Connected to cluster with %d host(s): %j', client.hosts.length, client.hosts.keys());
  delete_todos(client, delete_users, shutdown_db);
});
