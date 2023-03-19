const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

let getResponse = (filteredisbns, responseTitle) => {
  let filteredBooks = [];

  for(isbn of filteredisbns) {
    let title = books[isbn].title;
    let author = books[isbn].author;
    let reviews = books[isbn].reviews;
    filteredBooks.push({
      "title": title, 
      "isbn": isbn , 
      "author": author,
      "reviews": reviews
    });
  }
  
  return{[responseTitle]: filteredBooks};
}

function getBooks() {
    return new Promise((resolve, reject) => {
        resolve({"status": 200, "books": books});
    });
}

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  getBooks().then(result => {
    res.status(result.status).send(JSON.stringify(result.books, null, 4));
  });
});

function getBooksByisbn(isbn) {
    return new Promise((resolve, reject) => {
      if(isbn in books){
        resolve({"status": 200, "books": books[isbn]});
      } else {
        reject({"status": 404, "message": {message: `Book with isbn ${isbn} does not exist`}})
      }
    });
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  getBooksByisbn(isbn)
    .then(result => {
        res.status(result.status).send(JSON.stringify(result.books, null, 4));
    })
    .error(error => {
        res.status(error.status).send(error.message);
    });
 });

 function getBooksByAuthor(author) {
    let filteredisbns = Object.keys(books).filter(isbn => books[isbn].author === author);
    let response = getResponse(filteredisbns, "Books By Author");

    return new Promise((resolve, reject) => {
      resolve({"status": 200, "books": response});
    });
 }
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;

  getBooksByAuthor(author).then(result => {
    res.status(result.status).send(JSON.stringify(result.books, null, 4));
  });
});

function getBooksByTitle(title) {
  let filteredisbns = Object.keys(books).filter(isbn => books[isbn].title === title);
  let response = getResponse(filteredisbns, "Books By Title");

  return new Promise((resolve, reject) => {
    resolve({"status": 200, "books": response});
  });
}

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    getBooksByTitle(title).then(result => {
      res.status(result.status).send(JSON.stringify(result.books, null, 4));
    });
});

//registers the user by adding details
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if(username && password) {
    if(isValid(username)) {
      res.status(404).json({message: `user ${username} already exists`});
    } else {
        users.push({"username": username, "password": password});
        res.status(200).json({message: "Registration successful. You can login now."})
    }
  } else {
    return res.status(404)
        .json({message: "Unable to register user. Please provide username and pasword"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if(isbn in books) {
      return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
      return res.status(404).json({message: `Book with isbn ${isbn} does not exist`})
    }
});

//Synchronous versions of the getters
// Get the book list available in the shop
public_users.get('/sync/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/sync/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if(isbn in books) {
    return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  } else {
      return res.status(404).json({message: `Book with isbn ${isbn} does not exist`})
  }
 });
  
// Get book details based on author
public_users.get('/sync/author/:author',function (req, res) {
  const author = req.params.author;
  let filteredisbns = Object.keys(books).filter(isbn => books[isbn].author === author);
  let response = getResponse(filteredisbns, "Books By Author");

  return res.status(200).send(JSON.stringify(response, null, 4));
});

// Get all books based on title
public_users.get('/sync/title/:title',function (req, res) {
    const title = req.params.title;
    let filteredisbns = Object.keys(books).filter(isbn => books[isbn].title === title)
    let response = getResponse(filteredisbns, "Books By Title");
    
    return res.status(200).send(JSON.stringify(response, null, 4));
});

module.exports.general = public_users;
