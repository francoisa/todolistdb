CREATE KEYSPACE "todolist" WITH REPLICATION = {
  'class': 'SimpleStrategy', 'replication_factor': 1
};

CREATE KEYSPACE "todolist_dev" WITH REPLICATION = {
  'class': 'SimpleStrategy', 'replication_factor': 1
};

USE "todolist";

CREATE TABLE IF NOT EXISTS "users" (
  "username" text PRIMARY KEY,
  "email" text,
  "salt" bigint,
  "password" blob,
  "first_name" text,
  "last_name" text
);

CREATE TABLE IF NOT EXISTS "todos" (
  "username" text,
  "id" timeuuid,
  "content" text,
  "status" int,
  PRIMARY KEY ("username", "id")
);
