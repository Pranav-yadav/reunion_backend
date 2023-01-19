#!/bin/bash

# Create required collections
mongo admin --eval "db.createCollection('users')"
mongo admin --eval "db.createCollection('posts')"
mongo admin --eval "db.createCollection('likes')"
mongo admin --eval "db.createCollection('comments')"

# Import data into the 'users' collection
mongoimport --db admin --collection users --file /app/data/users.json

# Import data into the 'posts' collection
mongoimport --db admin --collection posts --file /app/data/posts.json

# Import data into the 'likes' collection
mongoimport --db admin --collection likes --file /app/data/likes.json

# Import data into the 'comments' collection
mongoimport --db admin --collection comments --file /app/data/comments.json
