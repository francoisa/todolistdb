# to do list database

## Overview
To do list service with cassandra db store 

## REST API 

### User

|HTTP VERB|Path|Parameters|Body|Description|
|---------|----|----------|----|-----------|
|GET|/users/[:offset]/[:length]|none|none|list users|
|GET|/user/:id|user id|none|show details of user|
|DELETE|/user/:id|user id|none|delete user and todo items|
|PUT|/user|none||update user|
|POST|/user|none||create new user|


### Todo
|HTTP VERB|Path|Parameters|Body|Description|
|---------|----|----------|----|-----------|
|GET|/todos/:id/[:offset]/[:length]|user id|none|list todo entries for the user|
|GET|/todo/:id|todo id|none|show details of item|
|DELETE|/todo/:id|todo id|none|delete todo item|
|PUT|/todo|none||update item|
|POST|/todo|none||create new item|


## Database 

The database is two tables:
* a User table
* a Todo table

### User Table

|Column|Type|Description|
|------|----|-----------|
|username|text|primary key|
|email|text||
|password|blob||
|first_name|text||
|last_name|text||

### Todo Table

|Column|Type|Description|
|------|----|-----------|
|id|uuid|primary key|
|user_id|text|foreign key|
|content|text||
|status|int|0: open, 1: in progress, 2: done, 3: withdrawn, 4|
