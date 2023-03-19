const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

//Checks if the username already exists
const isValid = (username)=>{ 
    let filteredUsers = users.filter(user => user.username === username);

    return (filteredUsers.length > 0)
}

const authenticatedUser = (username,password)=>{ 
    let validUsers = users.filter( user => {
        return user.username === username && user.password === password;
    });

    return (validUsers.length > 0);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if(!username || !password) {
      return res.status(404).send("Unable to login. Please provide username and password");
  }

  if(!authenticatedUser(username, password)) {
      return res.status(208).send("Invalid login. Please verify username and password");
  }

  let accessToken = jwt.sign({
      data: password
  }, "access", { expiresIn: 60*60 });

  req.session.authorization = {
      accessToken, username
  }

  return res.status(200).send("user logged in successfully");
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  if(req.session.authorization) {
    const username = req.session.authorization["username"];
    
    if(!username) {
      return res.status(403).json({message: "User not authorized. Please login"});
    }

    const isbn = req.params.isbn;
    const review = req.query.review;
 
    if(!isbn in books) {
      return res.status(403).json({message: `Unable to find the book with isbn: ${isbn}. Please verify the isbn`})
    }

    if(!review) {
        return res.status(403).json({message: "Unable to update. Please verify the review"});
    }

    books[isbn].reviews[username] = review;
    res.status(200).json({message: `The review for book with isbn ${isbn} is added/updated`});
  } else {
    return res.status.apply(403).json({message: "No authorization found. Plean login"});
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  if(req.session.authorization) {
    const username = req.session.authorization["username"];
    
    if(!username) {
      return res.status(403).json({message: "User not authorized. Please login"});
    }

    const isbn = req.params.isbn;
 
    if(!isbn in books) {
      return res.status(403).json({message: `Unable to find the book with isbn: ${isbn}. Please verify the isbn`})
    }

    delete books[isbn].reviews[username];
    return res.status(200).json({message: `The review for book with isbn:${isbn} by ${username} is deleted`});
  } else {
    return res.status(403).json({message: "No authorization found. Please login"});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
