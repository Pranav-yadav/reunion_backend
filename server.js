const express = require("express");

const MongoClient = require("mongodb").MongoClient;

const jwt = require("jwt-simple");

const app = express();
require("dotenv").config();
const { PORT } = process.env;

app.get("/", (req, res) => {
  res.send("Hi! :)");
});

app.post("/api/authenticate", (req, res) => {
  // authentication logic
  // get email and password from the request body
  const { email, password } = req.body;

  // check if the email and password match the dummy credentials
  if (email === "dummy@email.com" && password === "password") {
    // create a JWT token
    const payload = { email };
    const secret = "secret_key";
    const token = jwt.encode(payload, secret);

    // send the JWT token as the response
    res.json({ token });
  } else {
    // send a 401 Unauthorized response if the credentials are invalid
    res.status(401).json({ message: "Invalid email or password" });
  }
  // return JWT token
});

app.post("/api/follow/:id", (req, res) => {
  // get user id from the route parameter
  const userId = req.params.id;

  //get the user's token from the request headers
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.decode(token, "secret_key");

  // validate the token and extract the user's email
  if (!decoded) {
    res.status(401).json({ message: "Unauthorized" });
  }
  const currentUserEmail = decoded.email;

  //connect to the mongodb
  MongoClient.connect(
    "mongodb://localhost:27017/",
    { useUnifiedTopology: true },
    (err, client) => {
      if (err) {
        res
          .status(500)
          .json({ message: "Error connecting to the database", error: err });
      }
      const db = client.db("social_media");
      const collection = db.collection("users");

      //find the current user
      collection.findOne({ email: currentUserEmail }, (err, currentUser) => {
        if (err) {
          res
            .status(500)
            .json({ message: "Error finding the user", error: err });
        }

        //find the user to follow
        collection.findOne({ _id: ObjectId(userId) }, (err, userToFollow) => {
          if (err) {
            res
              .status(500)
              .json({ message: "Error finding the user", error: err });
          }

          // check if the current user already following the user
          if (currentUser.following.includes(userId)) {
            res
              .status(409)
              .json({ message: "You are already following this user" });
          } else {
            // update the current user's following array to include the user to follow
            collection.updateOne(
              { email: currentUserEmail },
              { $push: { following: userId } },
              (err, result) => {
                if (err) {
                  res
                    .status(500)
                    .json({ message: "Error updating the user", error: err });
                }
                res.json({
                  message: "You are now following " + userToFollow.username,
                });
              }
            );
          }
        });
      });
      client.close();
    }
  );
});

app.post("/api/unfollow/:id", (req, res) => {
  // get user id from the route parameter
  const userId = req.params.id;

  //get the user's token from the request headers
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.decode(token, "secret_key");

  // validate the token and extract the user's email
  if (!decoded) {
    res.status(401).json({ message: "Unauthorized" });
  }
  const currentUserEmail = decoded.email;

  //connect to the mongodb
  MongoClient.connect(
    "mongodb://localhost:27017/",
    { useUnifiedTopology: true },
    (err, client) => {
      if (err) {
        res
          .status(500)
          .json({ message: "Error connecting to the database", error: err });
      }
      const db = client.db("social_media");
      const collection = db.collection("users");

      //find the current user
      collection.findOne({ email: currentUserEmail }, (err, currentUser) => {
        if (err) {
          res
            .status(500)
            .json({ message: "Error finding the user", error: err });
        }

        // check if the current user already following the user
        if (!currentUser.following.includes(userId)) {
          res.status(404).json({ message: "You are not following this user" });
        } else {
          // update the current user's following array to remove the user to unfollow
          collection.updateOne(
            { email: currentUserEmail },
            { $pull: { following: userId } },
            (err, result) => {
              if (err) {
                res
                  .status(500)
                  .json({ message: "Error updating the user", error: err });
              }
              res.json({ message: "You have unfollowed the user" });
            }
          );
        }
      });
      client.close();
    }
  );
});

app.get("/api/user", (req, res) => {
  //get the user's token from the request headers
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.decode(token, "secret_key");

  // validate the token and extract the user's email
  if (!decoded) {
    res.status(401).json({ message: "Unauthorized" });
  }
  const currentUserEmail = decoded.email;

  //connect to the mongodb
  MongoClient.connect(
    "mongodb://localhost:27017/",
    { useUnifiedTopology: true },
    (err, client) => {
      if (err) {
        res
          .status(500)
          .json({ message: "Error connecting to the database", error: err });
      }
      const db = client.db("social_media");
      const collection = db.collection("users");

      //find the current user
      collection.findOne({ email: currentUserEmail }, (err, currentUser) => {
        if (err) {
          res
            .status(500)
            .json({ message: "Error finding the user", error: err });
        }
        // get the number of followers and followings
        const followers = currentUser.followers.length;
        const followings = currentUser.following.length;
        res.json({
          username: currentUser.username,
          followers: followers,
          followings: followings,
        });
      });
      client.close();
    }
  );
});

app.post("/api/posts", (req, res) => {
  //get the user's token from the request headers
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.decode(token, "secret_key");

  // validate the token and extract the user's email
  if (!decoded) {
    res.status(401).json({ message: "Unauthorized" });
  }
  const currentUserEmail = decoded.email;

  //get title and description from the request body
  const { title, description } = req.body;

  //connect to the mongodb
  MongoClient.connect(
    "mongodb://localhost:27017/",
    { useUnifiedTopology: true },
    (err, client) => {
      if (err) {
        res
          .status(500)
          .json({ message: "Error connecting to the database", error: err });
      }
      const db = client.db("social_media");
      const collection = db.collection("posts");

      //create a new post
      const post = {
        title: title,
        description: description,
        created_at: new Date(),
        created_by: currentUserEmail,
        comments: [],
        likes: [],
      };
      collection.insertOne(post, (err, result) => {
        if (err) {
          res
            .status(500)
            .json({ message: "Error inserting the post", error: err });
        }
        res.json({
          post_id: result.insertedId,
          title: title,
          description: description,
          created_at: post.created_at,
        });
      });
      client.close();
    }
  );
});

app.delete("/api/posts/:id", (req, res) => {
  //get the post id from the route parameter
  const postId = req.params.id;

  //get the user's token from the request headers
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.decode(token, "secret_key");

  // validate the token and extract the user's email
  if (!decoded) {
    res.status(401).json({ message: "Unauthorized" });
  }
  const currentUserEmail = decoded.email;

  //connect to the mongodb
  MongoClient.connect(
    "mongodb://localhost:27017/",
    { useUnifiedTopology: true },
    (err, client) => {
      if (err) {
        res
          .status(500)
          .json({ message: "Error connecting to the database", error: err });
      }
      const db = client.db("social_media");
      const collection = db.collection("posts");

      //find the post
      collection.findOne({ _id: ObjectId(postId) }, (err, post) => {
        if (err) {
          res
            .status(500)
            .json({ message: "Error finding the post", error: err });
        }

        //check if the post belong to the current user
        if (post.userEmail !== currentUserEmail) {
          res.status(401).json({ message: "Unauthorized" });
        } else {
          //delete the post
          collection.deleteOne({ _id: ObjectId(postId) }, (err, result) => {
            if (err) {
              res
                .status(500)
                .json({ message: "Error deleting the post", error: err });
            }
            res.json({ message: "Post deleted successfully" });
          });
        }
      });
      client.close();
    }
  );
});

app.post("/api/like/:id", (req, res) => {
  const { id } = req.params;
  const { user: currentUser } = req.session;

  if (!currentUser) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const currentUserId = currentUser.id;

  const post = posts.find((post) => post.id === id);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const { likes } = post;

  const alreadyLiked = likes.some((userId) => userId === currentUserId);

  if (alreadyLiked) {
    return res.status(409).json({ message: "Already liked" });
  }

  likes.push(currentUserId);

  res.json({ message: "Post liked" });
  // like post logic
  // ...
});

app.post("/api/unlike/:id", (req, res) => {
  //get the post id from the route parameter
  const postId = req.params.id;

  //get the user's token from the request headers
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.decode(token, "secret_key");

  // validate the token and extract the user's email
  if (!decoded) {
    res.status(401).json({ message: "Unauthorized" });
  }
  const currentUserEmail = decoded.email;

  //connect to the mongodb
  MongoClient.connect(
    "mongodb://localhost:27017/",
    { useUnifiedTopology: true },
    (err, client) => {
      if (err) {
        res
          .status(500)
          .json({ message: "Error connecting to the database", error: err });
      }
      const db = client.db("social_media");
      const collection = db.collection("posts");

      //find the post
      collection.findOne({ _id: ObjectId(postId) }, (err, post) => {
        if (err) {
          res
            .status(500)
            .json({ message: "Error finding the post", error: err });
        }

        // check if the current user already liked the post
        if (!post.likes.includes(currentUserEmail)) {
          res.status(404).json({ message: "You have not liked this post" });
        } else {
          // update the post's likes array to remove the current user
          collection.updateOne(
            { _id: ObjectId(postId) },
            { $pull: { likes: currentUserEmail } },
            (err, result) => {
              if (err) {
                res
                  .status(500)
                  .json({ message: "Error updating the post", error: err });
              }
              res.json({ message: "You have unliked the post" });
            }
          );
        }
      });
      client.close();
    }
  );
});

app.post("/api/comment/:id", (req, res) => {
  // Get the text from the request body
  const text = req.body.text;
  // Get the id from the request parameters
  const postId = parseInt(req.params.id, 10);
  // Find the post in the database
  const post = db.posts.find(post => post.id === postId);
  // Add the comment to the post
  post.comments.push({ text });
  // Send the updated post back to the client
  res.json(post);
});

app.get("/api/posts/:id", (req, res) => {
  // Get the post ID from the request parameters
  const id = req.params.id;

  // Find the post in the array of posts
  const post = posts.find(p => p.id === id);

  // If the post is not found, return a 404 status
  if (!post) {
    return res.status(404).send("Post not found");
  }

  // Return the post
  res.send(post);
});

app.get("/api/all_posts", (req, res) => {
  // Get all posts from the database
  const query = "SELECT * FROM posts";
  db.query(query, (err, result) => {
    if (err) {
      // If there is an error, send an HTTP 500 error
      res.status(500).send("Error retrieving posts");
    } else {
      // If there is no error, send the result as JSON
      res.json(result);
    }
  });
});

// listen for req's on specific port
app.listen(PORT, () => {
  console.log(`[🟢][Success] Server started. Listening on port: ${PORT}`);
  console.log(`Visit http://localhost/${PORT}`);
});
