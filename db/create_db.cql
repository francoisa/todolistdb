CREATE KEYSPACE "todolist" WITH REPLICATION = {
  'class': 'SimpleStrategy', 'replication_factor': 1
};

USE "todolist";

CREATE TABLE "users" (
  "username" text PRIMARY KEY,
  "email" text,
  "password" blob,
  "first_name" text,
  "last_name" text
);

CREATE TABLE "todos" (
  "username" text,
  "id" timeuuid,
  "content" text,
  "status" int,
  PRIMARY KEY ("username", "id")
);
