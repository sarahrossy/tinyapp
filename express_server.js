const express = require("express");
const morgan = require('morgan');
const bodyParser = require("body-parser"); // used for post requests, turns JSON (string) into JS
const cookieParser = require('cookie-parser');
const { emailExists } = require('./helpers/userHelpers');
const app = express(); // creates an express server called app
const PORT = 8080; // default port 8080

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

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

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = {
    urls: urlDatabase,
    //username: req.cookies["username"]
    user: users[userID]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = {
    urls: urlDatabase,
    //username: req.cookies["username"],
    user: users[userID]
  };
  res.render("urls_new", templateVars);
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
  urlDatabase[req.params.shortURL] = req.body.newLongURL;
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('user_id', username);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  // cookie file is global scope
  res.clearCookie('user_id');
  res.redirect(`/urls`);
});

app.get("/register", (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = {
    //username: req.cookies["username"]
    user: users[userID]
  };
  res.render('registration', templateVars);

});

app.post("/register", (req, res) => {
  const incomingEmail = req.body.email;
  const incomingName = req.body.name;
  const incomingPassword = req.body.password;
  if (emailExists(users, incomingEmail)) {
    console.log("email already exists");
    res.redirect('/register');
  } else {
    const newUser = {
      name: incomingName,
      email: incomingEmail,
      password: incomingPassword
    }
    const newUserID = generateRandomString(6, '#a');
    users[newUserID] = newUser;
    res.cookie('user_id', newUserID);
  }
  res.redirect('/urls');
})

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { 
    shortURL: shortURL,
    longURL: urlDatabase[shortURL],
    //username: req.cookies.username
    user: req.cookies['user_id']
  }; 
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
