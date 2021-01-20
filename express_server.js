const express = require("express");
const app = express(); // creates an express server called app
const PORT = 8080; // default port 8080
const morgan = require('morgan');
var cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(cookieParser());

function generateRandomString(length, chars) {
  var mask = '';
  if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
  if (chars.indexOf('#') > -1) mask += '0123456789';
  var result = '';
  for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
  return result;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}; // normally express backend talks to database, then sends to front end

const bodyParser = require("body-parser"); // used for post requests, turns JSON (string) into JS
app.use(bodyParser.urlencoded({extended: true}));

// ROUTES - creating URL paths that the app can use
// the first parameter affects the URL itself
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6, '#a');
  res.redirect(`/urls/${shortURL}`); 
  urlDatabase[shortURL] = req.body.longURL;
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`); 
});

app.post("/urls/:shortURL", (req, res) => {
  // how do we save the input value from the form in urls_show and add it to the urlDatabase object on the server side?
  // what syntax do I use to change the values inside the urlDatabase object?
  urlDatabase[req.params.shortURL] = req.body.newLongURL;
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  // cookie file is global scope
  res.clearCookie('username');
  res.redirect(`/urls`);
});


app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL] }; 
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
