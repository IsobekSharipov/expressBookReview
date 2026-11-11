const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body || {};
  if (typeof username !== "string" || !username.trim() || typeof password !== "string" || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(book);
 });
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  const matches = Object.values(books).filter(book =>
    book.author.toLowerCase() === author
  );
  return res.status(200).json(matches);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const matches = Object.values(books).filter(book =>
    book.title.toLowerCase() === title
  );
  return res.status(200).json(matches);
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;


// Task 11: Asynchronous book retrieval using Axios and async/await.
// These functions call the public API endpoints implemented above.
// Start the Express server before invoking them.
const api = axios.create({
  baseURL: process.env.BOOKSTORE_API_URL || 'http://localhost:5000',
  timeout: 10000
});

async function getAllBooks() {
  const response = await api.get('/');
  return response.data;
}

async function getBookByISBN(isbn) {
  const response = await api.get('/isbn/' + encodeURIComponent(isbn));
  return response.data;
}

async function getBooksByAuthor(author) {
  const response = await api.get('/author/' + encodeURIComponent(author));
  return response.data;
}

async function getBooksByTitle(title) {
  const response = await api.get('/title/' + encodeURIComponent(title));
  return response.data;
}

// Promise callback example (equivalent to using async/await above).
function getAllBooksWithPromise() {
  return api.get('/').then(response => response.data);
}

module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
module.exports.getAllBooksWithPromise = getAllBooksWithPromise;
