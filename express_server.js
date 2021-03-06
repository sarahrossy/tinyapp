const express = require("express");
// for dev purposes - automatically restarts server
const morgan = require('morgan');
const bodyParser = require("body-parser"); 
// to keep track of user login status
const cookieSession = require('cookie-session');
// to hash passwords
const bcrypt = require('bcrypt');

// helper functions
const { emailOrPasswordEmpty, fetchUser, databaseFilter, generateRandomString } = require('./helpers/userHelpers');

const app = express();
const PORT = 8080;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
  })
);

// ejs pages found in /views 
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ:
  { longURL: "https://www.tsn.ca",
    userID: "aJ48lW" },
  i3BoGr:
  { longURL: "https://www.google.ca",
    userID: "aJ48lW" }
};

// user database format for example purposes
const users = {
  "userRandomID":
  {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple", 10)
  },
  "user2RandomID":
 {
   id: "user2RandomID",
   email: "user2@example.com",
   password: bcrypt.hashSync("dishwasher-funk", 10)
 }
};

// cannot refactor to helper files because requires users object in closure scope
const checkInvalidSession = function(req) {
  return (!req.session['user_id'] || !Object.keys(users).includes(req.session['user_id']))
};

// ROUTES

app.get("/register", (req, res) => {
  const userID = req.session['user_id'];
  const templateVars = {
    user: users[userID]
  };
  res.render('registration', templateVars);

});

app.post("/register", (req, res) => {
  const incomingEmail = req.body.email;
  const incomingPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(incomingPassword, 10);
  if (emailOrPasswordEmpty(incomingEmail, incomingPassword)) {
  res.render("error", {errorMessage: "Email or password are empty fields!"}); 
  } else if (fetchUser(users, incomingEmail)) {
    res.render("error", {errorMessage: "This email already exists in our database."});
  } else {
    const newUser = {
      email: incomingEmail,
      password: hashedPassword
    };
    const newUserID = generateRandomString(6, '#a');
    newUser.id = newUserID;
    users[newUserID] = newUser;
    req.session['user_id'] = newUserID;
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  const userID = req.session['user_id'];
  const templateVars = {
    urls: urlDatabase,
    user: users[userID]
  };
  res.render("login", templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const submittedPassword = req.body.password;
  const user = fetchUser(users, email);
  if (user) {
    console.log(submittedPassword);
    if (bcrypt.compareSync(submittedPassword, user.password)) {
      req.session.user_id = user.id;
      res.redirect('/urls');
    } else {
      console.log("Passwords do not match!");
      res.render("error", {errorMessage: "We were expecting a different password."});
    }
  } else {
    res.render("error", {errorMessage: "This email is not registered in our database!"});
  }
});

app.get("/", (req, res) => {
    res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userID = req.session['user_id'];
  if (checkInvalidSession(req)) {
    res.redirect(`/login`);
    return;
  }
  const filteredDatabase = databaseFilter(userID, urlDatabase);
  const templateVars = {
    urls: filteredDatabase,
    user: users[userID]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (checkInvalidSession(req)) {
    res.status(401);
    res.send("Unauthorized");
    return;
  }
  const shortURL = generateRandomString(6, '#a');
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.session['user_id']
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  if (checkInvalidSession(req)) {
    res.redirect('/login');
    return;
  }
  const userID = req.session['user_id'];
  const templateVars = {
    urls: urlDatabase,
    user: users[userID]
  };
  res.render("urls_new", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (checkInvalidSession(req)) {
    res.status(404);
    res.send("Unauthorized! Please login.")
    return;
  }
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  if (checkInvalidSession(req)) {
    res.status(404);
    res.send("Unauthorized! Please login.");
    return;
  }
  //check if the correct
  if (urlDatabase[req.parans.shortURL].userID === req.session['user_id']) {
    urlDatabase[req.params.shortURL] = {
      longURL: req.body.newLongURL,
      userID: req.session['user_id']
    };
    res.redirect(`/urls`);
  } else {
    res.status(404);
    res.send("You are not the authenticated user for these URLs!");
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  if (checkInvalidSession(req)) {
    res.redirect('/login');
    return;
  }
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: req.session['user_id']
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
