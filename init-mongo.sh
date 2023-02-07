#!/bin/bash

# Create a new database named 'social_media'
mongo admin --eval "db.createDatabase('social_media')"

# Create required collections
mongo social_media --eval "db.createCollection('users')"
mongo social_media --eval "db.createCollection('posts')"
mongo social_media --eval "db.createCollection('likes')"
mongo social_media --eval "db.createCollection('comments')"

# Import data into the 'users' collection
mongoimport --db social_media --collection users --file /app/data/users.json

# Import data into the 'posts' collection
mongoimport --db social_media --collection posts --file /app/data/posts.json

# Import data into the 'likes' collection
mongoimport --db social_media --collection likes --file /app/data/likes.json

# Import data into the 'comments' collection
mongoimport --db social_media --collection comments --file /app/data/comments.json
