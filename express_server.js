const express = require("express");
const morgan = require('morgan');
const bodyParser = require("body-parser"); // used for post requests, turns JSON (string) into JS
//const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const { emailExists, emailOrPasswordEmpty, fetchUser, databaseFilter, generateRandomString } = require('./helpers/userHelpers');

const app = express(); // creates an express server called app
const PORT = 8080; // default port 8080

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
  })
);

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ:
  { longURL: "https://www.tsn.ca",
    userID: "aJ48lW" },
  i3BoGr:
  { longURL: "https://www.google.ca",
    userID: "aJ48lW" }
};

const users = {
  "userRandomID":
  {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple"
  },
  "user2RandomID":
 {
   id: "user2RandomID",
   email: "user2@example.com",
   password: "dishwasher-funk"
 }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const userID = req.session['user_id'];
  const filteredDatabase = databaseFilter(userID, urlDatabase);
  const templateVars = {
    urls: filteredDatabase,
    user: users[userID]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6, '#a');
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.session['user_id']
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const userID = req.session['user_id'];
  const templateVars = {
    urls: urlDatabase,
    user: users[userID]
  };

  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = {
    longURL: req.body.newLongURL,
    userID: req.session['user_id']
  };
  res.redirect(`/urls`);
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
  const hashedPassword = bcrypt.hashSync(submittedPassword, 10);

  console.log(submittedPassword);
  console.log(hashedPassword);
  console.log(users);
  
  if (fetchUser(users, email)) {
    const user = fetchUser(users, email);
    if (bcrypt.compareSync(submittedPassword, hashedPassword)) {
      req.session.user_id = user.id;
      res.redirect('/urls');
    } else {
      console.log("Passwords do not match!");
      res.sendStatus(404);
    }
  } else {
    console.log("User is not registered in our database!");
    res.sendStatus(404);
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  const userID = req.session['user_id'];
  const templateVars = {
    user: users[userID]
  };
  res.render('registration', templateVars);

});

app.post("/register", (req, res) => {
  const incomingEmail = req.body.email;
  const incomingName = req.body.name;
  const incomingPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(incomingPassword, 10);
  if (emailExists(users, incomingEmail)) {
    console.log("email already exists");
    res.redirect('/register');
  } else if (emailOrPasswordEmpty(incomingEmail, incomingName)) {
    console.log("email or password are blank fields");
    res.sendStatus(404);
  } else if (fetchUser(users, incomingEmail)) {
    console.log("user already exists!");
    res.sendStatus(404);
  } else {
    console.log(users);
    const newUser = {
      // name: incomingName,
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

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    //cannot read property "longURL" pf undefined
    longURL: urlDatabase[shortURL].longURL,
    user: req.session['user_id']
  };
  res.render("urls_show", templateVars);
  //console.log(templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
